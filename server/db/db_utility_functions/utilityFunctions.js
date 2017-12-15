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

exports.eventHasInvitees = function(eventId){
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