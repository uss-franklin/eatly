const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const yelpSearch = require('./yelpController.js').yelpSearch;
const inviteSMS = require('.././twilioSms.js').inviteSMS;

let eventsRef = dbRef.child('events');
let yelpSearchResultsRef = dbRef.child('yelpSearchResults');


/*
This controller expects that the the request object to the corresponding route for this controller
includes a query string labeled as 'eventKey'. The value for this query string should be equal to the
eventKey passed to the event_form (inputForm) view as a result of calling the 'createEvent' route.
*/

exports.getEventRestaurants = function(req, res){
  
    let eventKey = req.query.eventKey;
    // console.log('req.body:', req.body)
    let eventRef = eventsRef.child(eventKey);
    // console.log('eventRef', eventRef)
    let returnObj = {};
    // console.log('eventKey', req.query)
    eventRef.once('value').then((eventDetails) => {
        returnObj.eventName = eventDetails.val().eventName;
        returnObj.eventDateTime = eventDetails.val().eventDateTime;
        returnObj.voteCutOffDateTime = eventDetails.val().voteCutOffDateTime;

        let yelpSearchResultForEventRef = yelpSearchResultsRef.child(eventDetails.val().yelpSearchResultsKey);
        return(yelpSearchResultForEventRef.once('value'));
    }).then((yelpSearchResultForEvent) => {
        returnObj.yelpSearchResultForEvent = yelpSearchResultForEvent;
        res.send(returnObj);
    }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });
};

exports.submitVote = function(req, res){

};

exports.sendInviteSMS = function(req, res){
    inviteSMS();
} 

exports.createEvent = function(req, res){
  console.log('request started')
    //object to be constructed from request object
    let searchRequestParams = {
        limit: 20,
        sort_by: 'best_match',
        location: req.body.address,
        locale: 'en_US',
        radius: 6437,//This value corresponds with 4 miles (in meters). The default value is 10000 meters(6.2 miles)
        term: req.body.searchTerm
        //longitude
        //latitude
        //categories:
    };

    let eventDetails = {
        locationDetails: {
            address: req.body.address,
            latitude: null,
            longitude: null
        },
        foodType: req.body.searchTerm,
        hostName: req.body.hostName,
        hostContactType: 'email',
        hostContactDetails: req.body.hostEmail,
        eventDateTime: new Date(req.body.dateTime).toString(),
        eventCreationDateTime: new Date().toString(),
        eventInvitees: [],
        voteCutOffDateTime: new Date(req.body.cutOffDateTime).toString(),
        eventName: req.body.eventName
    };

    //We should aim to get these guest emails and phone # entries as an object, so that we can insert directly into firebase db
    let guestEmailAddresses = req.body.guestEmails;
    let guestPhoneNumbers = req.body.guestPhones;

    for(let i = 0; i < req.body.guestEmails.length; i++){
        let eventInvitee = {
            Name: null,
            contactDetails: [],
            voteCompleted: false
        };

        if(guestEmailAddresses[i]){
            eventInvitee.emailAddress = guestEmailAddresses[i];
        }
        if(guestPhoneNumbers[i]){
            eventInvitee.phoneNumber = guestPhoneNumbers[i];
        }

        eventDetails.eventInvitees.push(eventInvitee);
    }

    yelpSearch(searchRequestParams, new Date('Thu Dec 21 2017 18:00:00 GMT-0500 (EST)')). then(yelpSearchResultsKey => {
        eventDetails.yelpSearchResultsKey = yelpSearchResultsKey;
        let newDataPath = eventsRef.push(eventDetails);
        console.log('ending the request, sending back', newDataPath.key)
        res.send(newDataPath.key); //send the eventKey
    });

};
