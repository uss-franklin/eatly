const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const yelpSearch = require('./yelpController.js').yelpSearch;

let eventRef = dbRef.child('event');

exports.createEvent = function(req, res){
    console.log(req.body);
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
        voteCutOffDateTime: new Date().toString() //new Date(req.body.voteCutOffDateTime).toString()
    };

    req.body.guestEmails.forEach((guestEmail) => {
        eventDetails.eventInvitees.push({
            Name: null,
            contactType: 'email',
            contactDetails: guestEmail,
            voteCompleted: false
        });
    });

    yelpSearch(searchRequestParams, new Date('Thu Dec 21 2017 18:00:00 GMT-0500 (EST)')). then(yelpSearchResultsKey => {
        eventDetails.yelpSearchResultsKey = yelpSearchResultsKey;
        let newDataPath = eventRef.push(eventDetails);
        res.send(newDataPath.key);
    });

    //res.send('Event Controller Test');
};
