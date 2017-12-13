const dbRef = require('../db/firebaseRealtimeDB.js').dbRef
let eventsRef = dbRef.child('events')

exports.getFinalResults = function() {
  req.body = {eventId}
  const eventRef = dbref.orderByChild(event.key).equalTo(`${request.body.eventId}`)
}