const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const yelpSearch = require('./yelpController.js').yelpSearch;

let eventRef = dbRef.child('event');

exports.createEvent = function(req, res){

    //object to be constructed from request object
    var searchRequestParams = {
        limit: 20,
        sort_by: 'best_match',
        location: 'crown heights',
        locale: 'en_US',
        radius: 6437,//This value corresponds with 4 miles (in meters). The default value is 10000 meters(6.2 miles)
        term: 'pizza'
        //longitude
        //latitude
        //categories:
    };

    yelpSearch(searchRequestParams, new Date('Thu Dec 21 2017 18:00:00 GMT-0500 (EST)')). then(yelpSearchResultsKey => {
        eventRef.push({
            locationDetails: {
                address: '369 Lexington Ave.',
                latitude: null,
                longitude: null
            },
            yelpSearchResultsKey: yelpSearchResultsKey,
            foodType: 'Pizza',
            hostName: 'Stephen Akinyooye',
            hostContactType: 'email',
            hostContactDetails: 'sakinyooye@gmail.com',
            eventDateTime: 'Thu Dec 21 2017 18:00:00 GMT-0500 (EST)', //'12/21/2017 6:00PM'
            voteCuteOffDateTime: 'Wed Dec 13 2017 09:00:00 GMT-0500 (EST)', //'12/13/2017 9:00 AM',
            eventCreationDateTime: 'Wed Nov 29 2017 12:37:48 GMT-0500 (EST)',
            eventInvitees: [{
                Name: 'RJ Barnett',
                contactType: 'email',
                contactDetails: 'rj@barnett.com',
                voteCompleted: true
            }, {
                Name: 'Jimmy Sanders-Cannon',
                contactType: 'email',
                contactDetails: 'jimmy@sanders-cannon.com',
                voteCompleted: true
            },
                {
                    Name: 'Gil Mandler',
                    contactType: 'email',
                    contactDetails: 'gil@mandler.com',
                    voteCompleted: true
                }
            ]
        });
    });

    res.send('Event Controller Test');
};
