const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('users')

const getBothEventTypes = (uid, eventType) => {
  return UsersRef.child(uid).child(eventType).once('value')
    .then(events => {
      console.log(events.val())
      return events.val()
    })
}

exports.getAuthUserCreatedEvents = (req, res) => {
  Promise.all([
    getBothEventTypes(req.query.uid, 'hostEvents'),
    getBothEventTypes(req.query.uid, 'invitedEvents')
  ])
  .then(allEvents => {
    if (allEvents[0] === null) allEvents[0] = []
    if (allEvents[1] === null) allEvents[1] = []
    let eventsObj = {
      hostEvents: allEvents[0],
      invitedEvents: allEvents[1]
    }
    res.send(eventsObj)
  })

}



