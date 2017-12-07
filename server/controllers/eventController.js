const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const yelpSearch = require('./yelpController.js').yelpSearch;
const inviteSMS = require('.././twilioSms.js').inviteSMS;
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;
let sendInviteEmail = require('./inviteEmailController.js').sendInviteEmail;

const eventsRef = dbRef.child('events');
const yelpSearchResultsRef = dbRef.child('yelpSearchResults');

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
        returnObj.eventHost = Object.keys(eventDetails.val().eventHost)[0];

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

exports.sendInviteSMS = function(req, res){
    inviteSMS()
    console.log('sending SMS message to Invitees')
}

const createEventUsersVoteList = function(count) {
    let restaurantsObj = {}
    for (let i = 0; i < count; i++) {
        restaurantsObj[i] = '-'
    }
    return restaurantsObj
}

const createEventDetail = function(details, hostId, guestIds, yelpResults) {
    let {yelpSearchResultsKey, count} = yelpResults;
    let eventDetails = {
        locationDetails: {
            address: details.address,
            latitude: null,
            longitude: null
        },
        foodType: details.searchTerm,
        eventHost :{
            [hostId]: createEventUsersVoteList(count)
        },
        eventDateTime: new Date(details.dateTime).toString(),
        eventCreationDateTime: new Date().toString(),
        voteCutOffDateTime: new Date(details.cutOffDateTime).toString(),
        eventName: details.eventName,
        yelpSearchResultsKey: yelpSearchResultsKey
    };
    let eventInvitees = {}
    guestIds.forEach(id => eventInvitees[id] = createEventUsersVoteList(count))
    eventDetails.eventInvitees = eventInvitees
    
    return eventDetails
}

const createYelpResults = function(searchRequestParams) {
    return yelpSearch(searchRequestParams, new Date('Thu Dec 21 2017 18:00:00 GMT-0500 (EST)'))
        .then((yelpResults) => {
            return yelpResults
        });
}

exports.createEvent = function(req, res){
    console.log('request started')

    //sends email to users when button is clicked

    req.body.guestEmails.forEach(function(email){
        sendInviteEmail(email)
    })

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
    //need to create the ref to new event so that we can add it to the each user
    let newEvent = eventsRef.push()
    Promise.all([
        createAnonUsers(req.body.hostEmail, newEvent.key, true),
        createGuestEmailUser(req.body.guestEmails, newEvent.key, false),
        createYelpResults(searchRequestParams),
    ])
    //var resultsarr unpacks to hostId, guestIds, yelpResults
    .then(resultsArr => createEventDetail(req.body, ...resultsArr))
    .then(eventDetails => {
        newEvent.set(eventDetails) //set the event details in firebase
        console.log('ending the request, sending back', newEvent.key);
        res.send(newEvent.key)
    })
};
