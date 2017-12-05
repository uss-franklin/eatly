const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

let eventsRef = dbRef.child('events');
let yelpSearchResultsRef = dbRef.child('yelpSearchResults');

exports.voteOnRestaurant = function(req, res) {
    let {eventId, userId, restaurantId, vote} = req.body;
    let userRestaurantVoteRef = eventsRef.child(eventId).child('eventInvitees').child(userId).child(restaurantId);
    userRestaurantVoteRef.set(vote);

    Promise.all(allVotesGathered(eventId)).then((voteCompleted) => {
        let allVotesComplete = voteCompleted.reduce((acc, curr) => {
            return acc && curr;
        });
        res.send({allVotesGathered: allVotesComplete});
    }).catch((err) => console.error(err));
};

let allVotesGathered = function(eventId){
    let allEventInviteesRef = eventsRef.child(eventId).child('eventInvitees');
    let eventHostRef = eventsRef.child(eventId).child('eventHost');

    promiseArr = [];
    promiseArr.push(hasCompletedVote(eventId, allEventInviteesRef));
    promiseArr.push(hasCompletedVote(eventId, eventHostRef));

    return promiseArr;

};

let hasCompletedVote = function(eventId, ref){
    return new Promise((resolve, reject) => {
        ref.once('value').then((entity) => {
            const entityObj = entity.val();
            for(const id in entityObj){
                if(entityObj.hasOwnProperty(id)){
                    const votes = entityObj[id];
                    for(const restaurantId in votes){
                        if(votes[restaurantId] === '-'){
                            resolve(false);
                        }
                    }
                }
            }
            resolve(true);
        }).catch((err) => {
            reject(err);
        });
    });
};