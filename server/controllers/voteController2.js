const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
var cron = require('node-cron');
var sendGuestResultsEmail = require('./guestResultsEmailController.js').sendGuestResultsEmail;
var sendHostResultsEmail = require('./hostResultsEmailController.js').sendHostResultsEmail;
const dbUtilFunctions = require('..//db/db_utility_functions/utilityFunctions.js');

let eventsRef = dbRef.child('events');
let usersRef = dbRef.child('users');
let yelpRef = dbRef.child('yelpSearchResults');

exports.getUserSpecialVoteStatus = function(req, res) {
    const {userId, eventId} = req.query;

    dbUtilFunctions.getUserSpecialVotes(userId, eventId)
    .then((specialVotes) => {
        res.send(specialVotes.val())
    })
    .catch((err) => {
        console.error('Error while getting users special vote status', err);
        res.sendStatus(500);
    })
};

exports.getConsensusOnEventsPastCutOff = function() {
    eventsRef.once('value').then((events) => {
        events = events.val();
        for (eventKey in events) {
            if (events.hasOwnProperty(eventKey)) {
                let groupConsensusRestaurant = events[eventKey].groupConsensusRestaurant;
                let voteCutOffDateTime = new Date(events[eventKey].voteCutOffDateTime);
                let currentDate = new Date();
                if (voteCutOffDateTime <= currentDate && !groupConsensusRestaurant) {
                    console.log('')
                    console.log('Event Key: ', eventKey, ' Cutoff Time: ', voteCutOffDateTime.toString(), 'Current Date/Time: ', currentDate.toString(), 'GroupConsensusRestaurant: ', groupConsensusRestaurant);
                    votingResultRef = eventsRef.child(eventKey).child('groupConsensusRestaurant');
                    checkForConsensus(eventKey, 'date').then((consensus) => {
                        if(consensus){
                            votingResultRef.set(consensus).then(() => {
                                //sends emails to host and all guests regarding the results of their event
                                sendResultsEmails(eventKey, consensus)
                                //this needs to be fixed
                                console.log(`consensus restaurant of ${consensus} was selected`);
                            });
                        } else {
                            //this needs to be fixed
                            console.error(`consensus restaurant couldn't be selected`);
                        }
                    });
                }
            }
        }
    }).catch((err) => {
        console.error(err);
    });
};

exports.voteOnRestaurant = function(req, res, routeFunc = true) {
    const {eventId, userId, restaurantId, vote} = req.body;

    return dbUtilFunctions.getUserRefForEvent(userId, eventId)
        .then((userEventRef) => {
            if (!userEventRef) {
                console.error(`Function: voteOnRestaurant --- There is a data integrity problem. userId should not correspond with both (or neither) of the refs`);
                res.sendStatus(500);
            } else {
                if (vote === 0 || vote === '0') {//veto
                    return Promise.all([dbUtilFunctions.setSpecialRestaurantVoteForUser(userEventRef, 'hasVetoed'),
                        dbUtilFunctions.addVetoedRestaurant(eventId, restaurantId),
                        dbUtilFunctions.setRestaurantVoteForUser(userEventRef, restaurantId, 0)
                    ]);
                } else if (vote === 1 || vote === '1') {//dislike
                    return dbUtilFunctions.setRestaurantVoteForUser(userEventRef, restaurantId, 0);
                } else if (vote === 3 || vote === '3') {//superlike
                    return Promise.all([dbUtilFunctions.setSpecialRestaurantVoteForUser(userEventRef, 'hasSuperLiked'),
                        dbUtilFunctions.setRestaurantVoteForUser(userEventRef,restaurantId, 3)]);
                } else { //like (vote === 2) or any other value that's passed
                    return dbUtilFunctions.setRestaurantVoteForUser(userEventRef, restaurantId, 2);
                }
            }
        })
        .then(() => res.sendStatus(200))
        .catch((err) => {
            console.error('Error while voting on restaurant: ', err);
            res.sendStatus(500);
        });
};

exports.calculateConsensus = function(req, res){
    let {eventId} = req.body;

    votingResultRef = eventsRef.child(eventId).child('groupConsensusRestaurant');


    checkForConsensus(eventId, 'vote').then((consensus) => {
        if(consensus){
            votingResultRef.set(consensus).then(() => {
                //sends all emails to host and guests regarding the results of their event
                sendResultsEmails(eventId, consensus)
                res.send(consensus);
            });
        } else {
            res.sendStatus(500);
        }
    }).catch((err) => {
        console.err(err);
        res.sendStatus(500);
    });
};

let checkForConsensus = function(eventId, consensusType){
    let allEventInviteesRef = eventsRef.child(eventId).child('eventInvitees');
    let eventHostRef = eventsRef.child(eventId).child('eventHost');

    let promiseArr = [];
    promiseArr.push(gatherVotes(eventId, allEventInviteesRef, consensusType));
    promiseArr.push(gatherVotes(eventId, eventHostRef, consensusType));
    promiseArr.push(dbUtilFunctions.getVetoedRestaurants(eventId));

    return Promise.all(promiseArr).then((resolvedPromiseArr) => {
        let arrOfVoteObjs = resolvedPromiseArr.slice(0,2);
        let vetoedRestaurants = resolvedPromiseArr[2];

        let completeVotes = arrOfVoteObjs.filter((voteObj) => Object.keys(voteObj).length !== 0);

        if(consensusType === 'vote') {
            if (arrOfVoteObjs.length === 0 || completeVotes.length !== arrOfVoteObjs.length) {
                return;
            } else {
                return (determineConsensus(arrOfVoteObjs, vetoedRestaurants));
            }
        }
        if(consensusType === 'date'){
            console.log(isNoVotes(completeVotes));
            if(completeVotes.length === 0 || isNoVotes(completeVotes) ){
                return getRandomConsensus(eventId);
            } else {
                return determineConsensus(arrOfVoteObjs, vetoedRestaurants);
            }
        }
    }).catch((err) => console.error(err));
};

let isNoVotes = function(arrOfVoteObjs){
    for(let i = 0; i < arrOfVoteObjs.length; i++){
        let voteObj = arrOfVoteObjs[i];
        for(restaurant in voteObj){
            if(voteObj[restaurant] !== '-'){
                return false;
            }
        }
    }

    return true;
};

let getRandomConsensus = function(eventId){
    let yelpSearchResultsKeyRef = eventsRef.child(eventId).child('yelpSearchResultsKey');

    return yelpSearchResultsKeyRef.once('value').then((yelpSearchResultsKey) => {
        let restaurantsRef = yelpRef.child(yelpSearchResultsKey.val());
        return restaurantsRef.once('value').then((restaurants) => {
            let randomConsensus = Math.floor(Math.random() * restaurants.val().length);
            return randomConsensus;
        });
    });
};

let gatherVotes = function(eventId, ref, consensusType){
    return new Promise((resolve, reject) => {
        let allRestaurantsVotedOn = true;
        let votesObj = {};

        ref.once('value').then((entity) => {
            const entityObj = entity.val();
            for(const id in entityObj){
                if(entityObj.hasOwnProperty(id)) {
                    const votes = entityObj[id].votes;
                    for(let i = 0; i < votes.length; i++) {
                        vote = votes[i];
                        if(vote === '-'){
                            allRestaurantsVotedOn = false;
                            if(consensusType === 'vote') {
                                break;
                            }
                        }

                        votesObj[i] = votesObj[i] ? votesObj[i] + vote : vote;
                    }
                }
                if (!allRestaurantsVotedOn && consensusType === 'vote') {
                    votesObj = {};
                    break;
                }
            }
            resolve(votesObj);
        }).catch((err) => {
            reject(err);
        });
    });
};

let determineConsensus = function(arrOfVoteObjs, vetoedRestaurants){
    let talliedVotesObj = tallyVotes(arrOfVoteObjs, vetoedRestaurants);

    let consensusMostVoted = Object.keys(talliedVotesObj).reduce((a, b) => {
        return talliedVotesObj[a] > talliedVotesObj[b] ? a : b;
    });

    return consensusMostVoted;
};

let tallyVotes = function(arrOfVoteObjs, vetoedRestaurants){
    let talliedVotesObj = {};
    console.log('VETOED RESTAURANTS: ', vetoedRestaurants);
    arrOfVoteObjs.forEach((voteObj) => {
        for(restaurantId in voteObj){
            if(!vetoedRestaurants.includes(restaurantId) && !vetoedRestaurants.includes(parseInt(restaurantId, 10))){
                talliedVotesObj[restaurantId] = talliedVotesObj[restaurantId] ? talliedVotesObj[restaurantId] + voteObj[restaurantId] : voteObj[restaurantId];
            }
        }
    });

    return talliedVotesObj;
};

let sendResultsEmails = function(eventId, consensus){
    let hostName, eventDate, eventName, eventLocation, hostId, guestUserIdArray, hostEmail;

    //Everything in this promise all block is what populates the above variables with necessary data
    // for the emails functions.
    Promise.all([

    //plucks hostname from the DB
    eventsRef.child(eventId).child('eventHost').once('value').then((result) => {
        // let hostId = Object.keys(result.val())[0]
        result = Object.keys(result.val())[0]
        console.log("HOST ID FOR HOSTNAME", result)
        var innerPromise = usersRef.child(result).child('name').once('value').then((nameResult) => {
            nameResult = nameResult.val()
            console.log("HOSTNAME IS :::: ", nameResult )
            return nameResult;
        })

        return innerPromise;
    }),

    //plucks event date&time from the DB
    eventsRef.child(eventId).child('eventDateTime').once('value').then((dateResult) =>  {
        dateResult = dateResult.val()
        console.log("DATE RESULT " + dateResult)
        return dateResult
    })
        .catch((err) => console.log("Error in checkForConsensus results date arg decorator " + err)),

    //plucks the event name from the DB
    eventsRef.child(eventId).child('eventName').once('value').then((eventNameResult) =>  {
        eventNameResult = eventNameResult.val()
        console.log("EVENT NAME RESULT " + eventNameResult)
        return eventNameResult
    })
        .catch((err) => console.log("Error in checkForConsensus results name decorator " + err)),

    //plucks the restaurant name from the DB
    eventsRef.child(eventId).child('yelpSearchResultsKey').once('value').then((yelpKey) => {
        yelpKey = yelpKey.val()
        console.log("YELP KEY ", yelpKey)
        console.log("CONSENSUS IN REST NAME QUERY FUNC " , consensus)
        return yelpRef.child(yelpKey).child(consensus).child('name').once('value')
            .then((locationName) => {
                locationName = locationName.val()
                console.log("LOCATION NAME " + locationName)
                return locationName
            })
            .catch((err) => console.log('error retrieving consensus location name : ', err))
    }).catch((err) => console.log('error retrieving consensus location name: ', err)),

    //plucks the host firebase ID from the DB
    eventsRef.child(eventId).child('eventHost').once('value').then((resultId) => {
        resultId = Object.keys(resultId.val())[0]
        console.log("HOST ID ", resultId)
        return resultId
    })
        .catch((err) => console.log("Error in checkForConsensus results eventHost ID decorator " + err)),

    //plucks the guest firebase Id's from the DB
    eventsRef.child(eventId).child('eventInvitees').once('value').then((resultInvitees) => {
        resultInvitees = Object.keys(resultInvitees.val())
        console.log("RESULT INVITEES ", resultInvitees)
        return resultInvitees
    })
        .catch((err) => console.log("Error in checkForConsensus results event Guests ID's decorator " + err)),

    //plucks the host email from the DB
    eventsRef.child(eventId).child('eventHost').once('value').then((result) => {
        result = Object.keys(result.val())[0]
        console.log("hostID in host email func issss :::", result)
        return usersRef.child(result).child('email').once('value').then((resultEmail) => {
            resultEmail = resultEmail.val()
            console.log("HOST EMAIL " + resultEmail)
            return resultEmail
        })
            .catch((err) => console.log('Error in checkForConsensus results host email decorator ' + err))
    })

    ])
    //the resolvedArray is what we will use for each necessary argument in the following send emails functions
    .then((resolvedArray) => {

        console.log("RESOLVED ARRAY ", resolvedArray)
        console.log("CONSENSUS !!! :::: " + consensus)

        hostName = resolvedArray[0]
        eventDate = resolvedArray[1]
        eventName = resolvedArray[2]
        eventLocation = resolvedArray[3]
        hostId = resolvedArray[4]
        guestUsersIdArray = resolvedArray[5]
        hostEmail = resolvedArray[6]

        console.log("RESOLVED ARRAY :::: " + resolvedArray)

        //logic here is to make sure every user results email is sent with their special user link
        //even tho it is all async, the endless hell of promises was so that every user gets their
        //own email with their own link, populated with all their user specific data
        for(let i = 0; i < guestUsersIdArray.length; i++){
            let email = ''

            usersRef.child(guestUsersIdArray[i]).child("email").once('value').then((result) => {
                email = result.val()
                sendGuestResultsEmail(email, hostName, eventDate, eventName, eventLocation, guestUsersIdArray[i], eventId)
                return ('email successfully sent to ' + email)
            })
        }

        sendHostResultsEmail(hostEmail, hostName, eventName, eventLocation, hostId, eventId)

    }).catch((err) => console.log("Error in resolved promise email array just before consensus send  : " + err))
}