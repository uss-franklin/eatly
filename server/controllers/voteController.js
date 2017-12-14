const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
var cron = require('node-cron');
var sendGuestResultsEmail = require('./guestResultsEmailController.js').sendGuestResultsEmail
var sendHostResultsEmail = require('./hostResultsEmailController.js').sendHostResultsEmail

let eventsRef = dbRef.child('events');
let usersRef = dbRef.child('users');
let yelpRef = dbRef.child('yelpSearchResults');

exports.getConsensusOnEventsPastCutOff = function() {
    eventsRef.once('value').then((events) => {
        events = events.val();
        for (eventKey in events) {
            if (events.hasOwnProperty(eventKey)) {
                let voteCutOffDateTime = new Date(events[eventKey].voteCutOffDateTime);
                let groupConsensusRestaurant = events[eventKey].groupConsensusRestaurant;
                let currentDate = new Date();
                //console.log('Event Key: ', eventKey, ' Cutoff Time: ', voteCutOffDateTime.toString(), ' GroupConsensusRestaurant: ', groupConsensusRestaurant);
                //console.log('voteCutOffDateTime <= currentDate =  ', voteCutOffDateTime <= currentDate, ' !groupConsensusRestaurant = ', !groupConsensusRestaurant);
                if (voteCutOffDateTime <= currentDate && !groupConsensusRestaurant) {
                    votingResultRef = eventsRef.child(eventKey).child('groupConsensusRestaurant');
                    checkForConsensus(eventKey, 'date').then((consensus) => {
                        if(consensus){
                            votingResultRef.set(consensus).then(() => {
                                //this needs to be fixed
                                console.log(`${eventKey} is passed it's current cutoff of ${voteCutOffDateTime} and consensus restaurant of ${consensus} was selected`);
                            });
                        } else {
                            //this needs to be fixed
                            console.error(`${eventKey} is passed it's current cutoff of ${voteCutOffDateTime} and consensus restaurant couldn't be selected`);
                            res.sendStatus(500);
                        }
                    });
                }
            }
        }
    }).catch((err) => {
        console.error(err);
    });
};

exports.voteOnRestaurant = function(req, res, routeFunc = true){
    let {eventId, userId, restaurantId, vote} = req.body;
    let hostEventUserRef = eventsRef.child(eventId).child('eventHost').child(userId);//.child(userId).child(restaurantId);
    let inviteeEventUserRef = eventsRef.child(eventId).child('eventInvitees').child(userId);
    let hostInviteeCheckPromises = [hostEventUserRef.once('value'), inviteeEventUserRef.once('value')];

    return Promise.all(hostInviteeCheckPromises).then((resolvedHostInviteeCheck) => {
        let userRestaurantVoteRef = getUserRestaurantVoteRef(eventId, userId, restaurantId, resolvedHostInviteeCheck);

        if(!userRestaurantVoteRef){
            console.error(`Function: voteOnRestaurant --- There is a data integrity problem. userId should not correspond with both (or neither) of the refs`);
            res.sendStatus(500);
        } else {
            votePromise = userRestaurantVoteRef.set(vote);

            if(routeFunc){
                votePromise.then(() => {
                    res.sendStatus(200);
                }).catch((err) => console.error(err));
            } else {
                //votePromise.then((test) => console.log(test));
                return votePromise;
            }
        }
    })
};

var getUserRestaurantVoteRef = function(eventId, userId, restaurantId, resolvedHostInviteeCheck) {
  console.log('resolvedHostInviteeCheck[0]', resolvedHostInviteeCheck[0].val())
  console.log('eventid: ', eventId, 'userid: ', userId, 'restaurantid:', restaurantId)
  console.log('resolvedHostInviteeCheck[1]', resolvedHostInviteeCheck[1].val())
    if(resolvedHostInviteeCheck[0].val() !== null && resolvedHostInviteeCheck[1].val() === null){
        return(eventsRef.child(eventId).child('eventHost').child(userId).child(restaurantId));

    } else if(resolvedHostInviteeCheck[0].val() === null && resolvedHostInviteeCheck[1].val() !== null){
        return(eventsRef.child(eventId).child('eventInvitees').child(userId).child(restaurantId));

    } else {
        return null;
    }
};

exports.calculateConsensus = function(req, res){
    let {eventId} = req.body;

    votingResultRef = eventsRef.child(eventId).child('groupConsensusRestaurant');


    checkForConsensus(eventId, 'vote').then((consensus) => {
        if(consensus){
            votingResultRef.set(consensus).then(() => {

                /* 
                    Hooked into this checkForConsensus function is the send results emails to guest and hosts.
                    the parameters for each are declared below, populated, then passed into send email functions
                    because each is populated differently and with different data, it all runs async.
                */
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

/*exports.voteAndCheckForConsensus = function(req, res){
    let {eventId} = req.body;
    console.log('voteAndCheckForConsensus req.body:', req.body)
    votingResultRef = eventsRef.child(eventId).child('groupConsensusRestaurant');

    exports.voteOnRestaurant(req, res, false).then(() => {
        checkForConsensus(eventId, 'vote').then((consensus) => {
            console.log('Consensus = ', consensus);
            if(consensus){
                votingResultRef.set(consensus).then(() => {
                    res.send(consensus);
                });
            } else {
                res.sendStatus(200);
            }
        });
    }).catch((err) => {
        console.err(err);
        res.sendStatus(500);
    });
};*/

let checkForConsensus = function(eventId, consensusType){
    let allEventInviteesRef = eventsRef.child(eventId).child('eventInvitees');
    let eventHostRef = eventsRef.child(eventId).child('eventHost');

    let promiseArr = [];
    promiseArr.push(gatherVotes(eventId, allEventInviteesRef, consensusType));
    promiseArr.push(gatherVotes(eventId, eventHostRef, consensusType));

    return Promise.all(promiseArr).then((arrOfVoteObjs) => {
        let completeVotes = arrOfVoteObjs.filter((voteObj) => Object.keys(voteObj).length !== 0);
        if(consensusType === 'vote') {
            if (arrOfVoteObjs.length === 0 || completeVotes.length !== arrOfVoteObjs.length) {
                return;
            } else {
                return (determineConsensus(arrOfVoteObjs));
            }
        }
        if(consensusType === 'date'){
            if(completeVotes.length === 0){
                return getRandomConsensus(eventId);
            } else {
                return determineConsensus(arrOfVoteObjs);
            }
        }
    }).catch((err) => console.error(err));
};

let getRandomConsensus = function(eventId){
    let yelpSearchResultsKeyRef = eventsRef.child(eventId).child('yelpSearchResultsKey');

    return yelpSearchResultsKeyRef.once('value').then((yelpSearchResultsKey) => {
        //DUMMY VALUE UNTIL RESTAURANT ID: NEEDS TO BE REPLACED
        let restaurantsRef = yelpRef.child(yelpSearchResultsKey.val()/*'-L-hw7GnMiqj-Rpjh3qf'*/);
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
                if(entityObj.hasOwnProperty(id)){
                    const votes = entityObj[id];
                    for(const restaurantId in votes){
                        if(votes[restaurantId] === '-' && votes.hasOwnProperty(restaurantId)){
                            allRestaurantsVotedOn = false;
                            if(consensusType === 'vote'){
                                break;
                            }
                        }
                        //This needs to change to boolean comparison once vote functionality is integrated with screens
                        if((votes[restaurantId] === true || votes[restaurantId] === 'true') && votes.hasOwnProperty(restaurantId)){
                            votesObj[restaurantId] = votesObj[restaurantId] ? votesObj[restaurantId] + 1 : 1;
                        }
                        if((votes[restaurantId] === false || votes[restaurantId] === 'false') && votes.hasOwnProperty(restaurantId)){
                            votesObj[restaurantId] = votesObj[restaurantId] ? votesObj[restaurantId] : 0;
                        }
                    }
                }
                if (!allRestaurantsVotedOn && consensusType === 'vote'){
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

let determineConsensus = function(arrOfVoteObjs){
    let talliedVotesObj = tallyVotes(arrOfVoteObjs);

    let consensusMostVoted = Object.keys(talliedVotesObj).reduce((a, b) => {
        return talliedVotesObj[a] > talliedVotesObj[b] ? a : b;
    });

    return consensusMostVoted;
};

let tallyVotes = function(arrOfVoteObjs){
    let talliedVotesObj = {};
    arrOfVoteObjs.forEach((voteObj) => {
        for(restaurantId in voteObj){
            talliedVotesObj[restaurantId] = talliedVotesObj[restaurantId] ? talliedVotesObj[restaurantId] + voteObj[restaurantId] : voteObj[restaurantId];
        }
    });

    return talliedVotesObj;
};