const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('users')

exports.getAuthUserCreatedEvents = (req, res) => {
  UsersRef.child(req.body.uid).child('invitedEvents').once('value')
    .then(events => res.send(data.val()))
 
}

