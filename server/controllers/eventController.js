const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const yelpSearch = require('./yelpController.js').yelpSearch;
const inviteSMS = require('.././twilioSms.js').inviteSMS;
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;
let sendInviteEmail = require('./inviteEmailController.js').sendInviteEmail;
let sendHostEmail = require('./hostEmailController.js').sendHostEmail;
let sendHostDeclineNotificationEmail = require('./hostDeclineNotificationEmailController.js').sendHostDeclineNotificationEmail
let sendHostResultsEmail = require('./hostResultsEmailController.js').sendHostResultsEmail;
let dbUtilFunctions = require('..//db/db_utility_functions/utilityFunctions.js');

const eventsRef = dbRef.child('events');
const yelpSearchResultsRef = dbRef.child('yelpSearchResults');

exports.validateEventUser = function(req, res){
    let {eventId, userId} = req.query;
    dbUtilFunctions.inviteeBelongsToEvent(userId, eventId)
    .then((bool) => res.send(bool))
    .catch((err) => console.log('Error while validating a user against an event', err))
};

exports.declineInvite = function(req, res){
    let {eventId, userId} = req.query;

    sendHostDeclineNotificationEmail(eventId, userId)

    Promise.all([dbUtilFunctions.deleteUserEvent(userId, eventId, false), dbUtilFunctions.deleteInviteeFromEvent(userId, eventId)])
    .then(() => dbUtilFunctions.eventHasInvitees(eventId))
    .then((eventHasInviteesBool) => {
        if(eventHasInviteesBool){
            res.send();
        } else {
            dbUtilFunctions.getHostId(eventId)
            .then((hostId) => Promise.all([dbUtilFunctions.deleteUserEvent(hostId, eventId, true), dbUtilFunctions.deleteEvent(eventId)]))
            .then(() => res.send())
        }
    })
    .catch((err) => console.log('Error while declining invite', err))
};


/********
 Name: getUnVotedRestaurants
 Description: The purpose of this function is to return an array of restaurant ids for a given event which have not yet been voted on by a given user.
 Invoked From: This function is invoked from the getEventRestaurants function (eventController.js).
 Expected Inputs: The function takes in two parameters: userId(corresponds with the user that is viewing the corresponding screen) and
 eventId (corresponds with the event that the user is voting on)
 Expected Outputs:
    - Success: If the user has not yet voted on all restaurants for the event, an array with the Ids (relative to the yelpSearch results for the event)
      of restaurants will be returned. If the user has already voted on all restaurants, an empty array will be returned.
    - Failure: An empty array is returned and error message is printed to console.
 *********/

const getUnVotedRestaurants = function(userId, eventId) {
    return dbUtilFunctions.getUserRefForEvent(userId, eventId)
    .then((userEventRef) => {
        if(!userEventRef) {
            console.error(`Function: getUnVotedRestaurants --- There is a data integrity problem. userId should not correspond with both (or neither) of the refs`);
            return [];
        } else {
            return dbUtilFunctions.getUserVotesForEvent(userEventRef)
                .then((restaurantVotes) => {
                    //reduce the votes for a given user into a list of restaurantIDs (restaurant IDs are stored in the database as index values)

                    let unvotedRestaurants = restaurantVotes.val().reduce(function(accumulator, currentValue, index) {
                        //a value of '-' indicates that a restaurant has not yet been voted on.
                        if (currentValue === '-'){
                            accumulator.push(index);
                        }
                        return accumulator;
                    }, []);

                    return unvotedRestaurants;
                });
        }
    })
};

/********
Name: getEventRestaurants
Description: The purpose of this function is to return some basic event details and full details of restaurants associated with an event which have not yet
been voted on by a given user.
Invoked From: This function is invoked from the following server route: http://localhost:3000/getRestaurants (index.js)
Expected Inputs: The query string for the get request must include an event ID and a user ID. For example:
    http://localhost:3000/getRestaurants?eventKey=[Event ID]&userId=[User ID]
 The eventKey value for this query string should be equal to the eventKey passed to the event_form (inputForm) view as a result of calling the
 'createEvent' route. The userID value for this query string should be equal to userID of the logged in user for authenticated users or the userId
 specified in the query string of the url specified in the user email/text from which the screen is accessed.
Expected Outputs:
    - Success: A single object which contains
    - Failure: HTTP Response 500
*********/

exports.getEventRestaurants = function(req, res){
    //Inputs to the function
    let {eventKey, userId} = req.query;

    let eventRef = eventsRef.child(eventKey);
    let returnObj = {}; //This is the object that will be returned from the function (sent in http response).

    //retrieves details of the specified event
    eventRef.once('value').then((eventDetails) => {
        returnObj.eventName = eventDetails.val().eventName;
        returnObj.eventDateTime = eventDetails.val().eventDateTime;
        returnObj.voteCutOffDateTime = eventDetails.val().voteCutOffDateTime;
        returnObj.eventDescription = eventDetails.val().eventDescription
        returnObj.eventHost = Object.keys(eventDetails.val().eventHost)[0];

        //call to function to get a promise which resolves with restaurants that a given user has not yet voted on
        let unVotedRestaurantsPromise = getUnVotedRestaurants(userId, eventKey);
        //unVotedRestaurantsPromise.then(arr => console.log(arr));

        let yelpSearchResultForEventRef = yelpSearchResultsRef.child(eventDetails.val().yelpSearchResultsKey);

        let yelpSearchResultsPromise = yelpSearchResultForEventRef.once('value');
        Promise.all([unVotedRestaurantsPromise, yelpSearchResultsPromise]).then((resolvedPromisesArr) => {
            let [unVotedRestaurantsArr, restaurants] = resolvedPromisesArr;
            let unVotedRestaurants = {};
            unVotedRestaurantsArr.forEach((restaurantIndex) => {
                unVotedRestaurants[restaurantIndex] = restaurants.val()[restaurantIndex];
            });

            returnObj.yelpSearchResultForEvent = unVotedRestaurants;
            res.send(returnObj);
        }).catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
    });
};

/********
 Name: sendInviteSMS
 Description:
 Invoked From:
 Expected Inputs:

 Expected Outputs:
 - Success:
 - Failure:
 *********/

exports.sendInviteSMS = function(req, res){
    inviteSMS()
    console.log('sending SMS message to Invitees')
}

/********
 Name: createEventUsersVoteList
 Description:
 Invoked From:
 Expected Inputs:

 Expected Outputs:
 - Success:
 - Failure:
 *********/

const createEventUsersVoteList = function(count) {
    let restaurantsObj = {}
    for (let i = 0; i < count; i++) {
        restaurantsObj[i] = '-'
    }
    return restaurantsObj
}

/********
 Name: getEventRestaurants
 Description:
 Invoked From:
 Expected Inputs:

 Expected Outputs:
 - Success:
 - Failure:
 *********/

const createEventDetail = function(details, hostId, guestIds, yelpResults) {
    let {yelpSearchResultsKey, count} = yelpResults;
    let specialVotes = {
        hasSuperLiked: false,
        hasVetoed: false
    };
    let hostDetails = {
        votes: createEventUsersVoteList(count),
        specialVotes: specialVotes

    };
    let eventDetails = {
        locationDetails: {
            address: details.address,
            latitude: null,
            longitude: null
        },
        foodType: details.searchTerm,
        eventHost :{
            [hostId]: hostDetails
        },
        vetoedRestaurants: createEventUsersVoteList(count),
        eventDateTime: new Date(details.dateTime).toString(),
        eventCreationDateTime: new Date().toString(),
        voteCutOffDateTime: new Date(details.cutOffDateTime).toString(),
        eventName: details.eventName,
        eventDescription: details.eventDescription,
        yelpSearchResultsKey: yelpSearchResultsKey
    };
    let eventInvitees = {}
    guestIds.forEach(id => {
        eventInvitees[id] = {};
        eventInvitees[id].votes = createEventUsersVoteList(count);
        eventInvitees[id].specialVotes = specialVotes;
    });
    eventDetails.eventInvitees = eventInvitees
    
    return eventDetails
}

const createYelpResults = function(searchRequestParams, eventDate) {
    return yelpSearch(searchRequestParams, eventDate)
        .then((yelpResults) => {
            return yelpResults
        });
}


/********
 Name: createEvent
 Description: The purpose of this function is to create an event as specified by a user on the create event screen. This
 function also performs the tasks that are necessary to create an event

 Expected Inputs: The function takes in two parameters:
 - req - This paramater will contain all information necessary to create an event: (1) hostname; (2) hostemail
         (3) event date/time; (4) event name; (5) restaurant location; (6) cuisine type; (7) event invitee (email and/or text)
 - res - standard object to send http response.
 Expected Outputs:
 - Success: An http response is sent back to the client. The response contains the ID for the event that was created by the
   function and the Id of the host who created the event.
 - Failure: An uncaught exception will be thrown (this needs to be addressed).
 *********/

exports.createEvent = function(req, res){
    console.log('create event request started')

    let usersRef = dbRef.child('users')
    let eventsRef = dbRef.child('events')


        //sets data for sending emails to convenient variables
        
        let eventDate = req.body.dateTime
        let eventName = req.body.eventName
        let hostEmail = req.body.hostEmail

    //object to be constructed from request object
    let searchRequestParams = {
        limit: 20,
        sort_by: 'best_match',
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        locale: 'en_US',
        radius: 6437,//This value corresponds with 4 miles (in meters). The default value is 10000 meters(6.2 miles)
        term: req.body.searchTerm || 'restaurant'
        //categories:
    };
    //need to create the ref to new event so that we can add it to the each user
    let newEvent = eventsRef.push()
    Promise.all([
        createAnonUsers(req.body.hostEmail, req.body.hostName, newEvent.key, true),
        createGuestEmailUser(req.body.guestEmails, req.body.guestNames, newEvent.key, false),
        createYelpResults(searchRequestParams, new Date(eventDate)),
    ])
    //var resultsarr unpacks to hostId, guestIds, yelpResults
    .then(resultsArr => createEventDetail(req.body, ...resultsArr))

    .then(eventDetails => {
        newEvent.set(eventDetails); //set the event details in firebase
        let returnObj = {eventId: newEvent.key, hostId: Object.keys(eventDetails.eventHost)[0]};
        console.log('ending the request, sending back return obj');


        //these are declared now and assigned after the following promises run
        let hostId, guestUserIds, hostName

        //retrieving newly set event specific details from DB for emails
        Promise.all([
            //plucks hostId from the DB
            eventsRef.child(returnObj.eventId).child('eventHost').once('value').then((resultId) => {
                    resultId = Object.keys(resultId.val())[0]
                    console.log("HOST ID ", resultId)
                    return resultId
                })
                .catch((err) => console.log("Error retrieving hostId from DB in create event eventController : ", err)),

            //plucks the guest firebase Id's from the DB
                eventsRef.child(returnObj.eventId).child('eventInvitees').once('value').then((resultInvitees) => {
                    resultInvitees = Object.keys(resultInvitees.val())
                    console.log("RESULT INVITEES ", resultInvitees)
                    return resultInvitees
                })
                .catch((err) => console.log("Error in checkForConsensus results event Guests ID's decorator " + err)),

                //plucks hostname from the DB
                eventsRef.child(returnObj.eventId).child('eventHost').once('value').then((result) => {
                    result = Object.keys(result.val())[0]
                    var innerPromise = usersRef.child(result).child('name').once('value').then((nameResult) => {
                        nameResult = nameResult.val()
                        return nameResult;
                    })
                    return innerPromise;
                })
        ]).then((resolvedArray) => {
            hostId = resolvedArray[0]
            guestUserIds = resolvedArray[1]
            hostName = resolvedArray[2]

            guestUserIds.forEach((userId) => {
                usersRef.child(userId).child('email').once('value').then((result) => {
                    let guestEmail = result.val()
                    sendInviteEmail(guestEmail, hostName, eventDate, eventName, userId, returnObj.eventId)
                    return ('email invitation successfully sent to ' + guestEmail)
                })
            })

            sendHostEmail(hostEmail, hostName, eventName, returnObj.eventId, hostId)

        })


        res.send(returnObj);
    }).catch(err => console.log('man down', err))
};
