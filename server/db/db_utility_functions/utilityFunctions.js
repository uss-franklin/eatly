const dbRef = require('../firebaseRealtimeDB.js').dbRef;
const eventsRef = dbRef.child('events');
const usersRef = dbRef.child('users');

exports.deleteInviteeFromEvent = function(userId, eventId) {
    return eventsRef.child(eventId).child('eventInvitees').child(userId).remove();
};

exports.deleteUserEvent = (uid, eid, isHost) => {
    let userType = isHost ? 'hostEvents' : 'invitedEvents';
    return usersRef.child(uid).child(userType).once('value')
        .then(hostEvents => {
            let eventsArr = hostEvents.val().slice();
            eventsArr.splice(eventsArr.indexOf(eid), 1);
            return usersRef.child(uid).child(userType).set(eventsArr);
        })
};

exports.inviteeBelongsToEvent = function(userId, eventId) {
    return eventsRef.child(eventId).child('eventInvitees').child(userId).once('value')
        .then((user) => !!user.val());
};

exports.eventHasInvitees = function(eventId) {
    return eventsRef.child(eventId).child('eventInvitees').once('value')
        .then(eventInvitees => !!eventInvitees.val());
};

exports.deleteEvent = function(eventId) {
    return eventsRef.child(eventId).remove();
};

exports.getHostId = function(eventId) {
    return eventsRef.child(eventId).child('eventHost').once('value')
    .then((host) => Object.keys(host.val())[0]);
};

exports.getUserRefForEvent = function(userId, eventId) {
    console.log(userId, eventId);
    const hostRef = eventsRef.child(eventId).child('eventHost').child(userId);
    const inviteeRef = eventsRef.child(eventId).child('eventInvitees').child(userId);

    return Promise.all([hostRef.once('value'), inviteeRef.once('value')])
    .then((hostInviteeArr) => {
        let hostInfo = hostInviteeArr[0].val();
        let inviteeInfo = hostInviteeArr[1].val();

        if((!hostInfo && !inviteeInfo) || (!!hostInfo && !!inviteeInfo)){
            return undefined;
        }

        return !!hostInfo ? hostRef : inviteeRef;
    })
};

exports.setRestaurantVoteForUser = function(userEventRef, restaurantId, voteValue) {
    return userEventRef.child('votes').child(restaurantId).set(voteValue);
};

exports.setSpecialRestaurantVoteForUser = function(userEventRef, voteType) {
    return userEventRef.child('specialVotes').child(voteType).set(true);
};

exports.addVetoedRestaurant = function(eventId, restaurantId) {
    const vetoedRestaurantRef = eventsRef.child(eventId).child('vetoedRestaurants').child(restaurantId);
    return exports.getRestaurantVetoStatus(eventId, restaurantId)
    .then((vetoStatus) => {
        if(vetoStatus.val() === '-'){
            return vetoedRestaurantRef.set(true);
        }
    });
};

exports.getVetoedRestaurants = function(eventId) {
    return eventsRef.child(eventId).child('vetoedRestaurants').once('value')
    .then((allRestaurantsVetoStatus) => {
        return allRestaurantsVetoStatus.val().reduce((accumulator, value, index) => {
            if(value!== '-'){
                accumulator.push(index);
            }
            return accumulator;
        },[]);
    });
};

exports.getRestaurantVetoStatus = function(eventId, restaurantId) {
    return eventsRef.child(eventId).child('vetoedRestaurants').child(restaurantId).once('value');
};

exports.getUserVotesForEvent = function(userEventRef) {
    return userEventRef.child('votes').once('value');
};

exports.getUserSpecialVotes = function(userId, eventId) {
    return exports.getUserRefForEvent(userId, eventId)
    .then((userEventRef) => userEventRef.child('specialVotes').once('value'))
};