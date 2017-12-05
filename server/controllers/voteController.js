const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
var cron = require('node-cron');

let eventsRef = dbRef.child('events');

exports.voteOnRestaurant = function(req, res, routeFunc = true){
    let {eventId, userId, restaurantId, vote, personType} = req.body;

    let userRestaurantVoteRef = eventsRef.child(eventId).child(personType).child(userId).child(restaurantId);
    votePromise = userRestaurantVoteRef.set(vote);

    if(routeFunc) {
        votePromise.then(() => {
            res.send();
        }).catch((err) => console.error(err));
    } else{
        return votePromise;
    }
};

exports.voteAndGetConsensus = function(req, res) {
    let {eventId} = req.body;
    votingResultRef = eventsRef.child(eventId).child('groupConsensusRestaurant');

    exports.voteOnRestaurant(req, res, false).then(() => {
        gatherVotesAndDetermineConsensus(eventId).then((consensus) => {
            if(consensus){
                votingResultRef.set(consensus).then(() => {
                    res.send(consensus);
                });
            } else {
                res.send(consensus);
            }
        }).catch((err) => console.error(err));
    }).catch((err) => console.err(err));
};

let gatherVotesAndDetermineConsensus = function(eventId){
    let allEventInviteesRef = eventsRef.child(eventId).child('eventInvitees');
    let eventHostRef = eventsRef.child(eventId).child('eventHost');

    promiseArr = [];
    promiseArr.push(gatherVotes(eventId, allEventInviteesRef));
    promiseArr.push(gatherVotes(eventId, eventHostRef));

    return Promise.all(promiseArr).then((arrOfVoteObjs) => {
        let completeVotes = arrOfVoteObjs.filter((voteObj) => Object.keys(voteObj).length !== 0);
        if(arrOfVoteObjs.length === 0 || completeVotes.length !== arrOfVoteObjs.length){
            return;
        } else{
            return(determineConsensus(arrOfVoteObjs));
        }
    }).catch((err) => console.error(err));

};

let tallyVotes = function(arrOfVoteObjs){
    let talliedVotesObj = {};
    for (restaurantId in arrOfVoteObjs[0]){
        arrOfVoteObjs.forEach((voteObj) => {
            talliedVotesObj[restaurantId] = talliedVotesObj[restaurantId] ? talliedVotesObj[restaurantId] + voteObj[restaurantId] : voteObj[restaurantId];
        });
    }
    return talliedVotesObj;
};

let determineConsensus = function(arrOfVoteObjs){
    let talliedVotesObj = tallyVotes(arrOfVoteObjs);

    let consensusMostVoted = Object.keys(talliedVotesObj).reduce((a, b) => {
        return talliedVotesObj[a] > talliedVotesObj[b] ? a : b;
    });
    return consensusMostVoted;
};

let gatherVotes = function(eventId, ref){
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
                             break;
                        }
                        //This needs to change to boolean comparison once vote functionality is integrated with screens
                        if(votes[restaurantId] === 'true' && votes.hasOwnProperty(restaurantId)){
                            votesObj[restaurantId] = votesObj[restaurantId] ? votesObj[restaurantId] + 1 : 1;
                        }
                        if(votes[restaurantId] === 'false' && votes.hasOwnProperty(restaurantId)){
                            votesObj[restaurantId] = votesObj[restaurantId] ? votesObj[restaurantId] : 0;
                        }
                    }
                }
                if (!allRestaurantsVotedOn){
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