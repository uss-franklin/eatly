const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('users')
const EventsRef = dbRef.child('events');

const getBothEventTypes = (uid, eventType) => {
  return UsersRef.child(uid).child(eventType).once('value')
    .then(events =>  events.val())
}

const getInvitedUsersDetails = (event) => {
  return Promise.all(Object.keys(event.eventInvitees).map(uid => {
    return UsersRef.child(uid).once('value')
          .then(user => {
            let {name, email} = user.val()
            console.log(name, email)
            return {uid: uid, name: name || '', email: email}
      })
  })).then(userDetails => {
    event.invitedUserDetails = userDetails
    return event
  })
}

const getEventDetails = (eventId, isHost) => {
  //pre-emptive return for passing an empty [] if the person has 
  //either no hosted or invited events
  if (eventId === undefined) return 
  return EventsRef.child(eventId).once('value')
    .then(event => {
      let eventDetails = event.val()
      // console.log('getting event details', eventId, eventDetails)
      eventDetails.eid = eventId
      if (!isHost) return eventDetails
      return getInvitedUsersDetails(eventDetails)
    })
}

exports.getSingleEvent = (req, res) => {
  getEventDetails(req.query.eid)
  .then(event => res.send(event))
}

exports.getAuthUserCreatedEvents = (req, res) => {
  Promise.all([
    getBothEventTypes(req.query.uid, 'hostEvents'),
    getBothEventTypes(req.query.uid, 'invitedEvents')
  ])
  .then(allEvents => {
    if (allEvents[0] === null) allEvents[0] = []
    if (allEvents[1] === null) allEvents[1] = []
    let hostEventsDetailsPromises = allEvents[0].map(event => getEventDetails(event, true))
    let invitedEventsDetailsPromises = allEvents[1].map(event => getEventDetails(event, false))
    Promise.all([...hostEventsDetailsPromises, ...invitedEventsDetailsPromises])
    .then(magic => {
      let eventsObj = {
        hostEvents: magic.slice(0, allEvents[0].length),
        invitedEvents: magic.slice(allEvents[0].length)
      }
      // console.log('**** Hosted Events***** \n' , eventsObj.hostEvents)
      // console.log('**** Invited Events***** \n' , eventsObj.invitedEvents)

      res.send(eventsObj)
    })
    
  })

}



