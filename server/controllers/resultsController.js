const dbRef = require('../db/firebaseRealtimeDB.js').dbRef
let YelpRef = dbRef.child('yelpSearchResults')

const getFinalResults = (yelpResultsKey, res) => {
  if (yelpResultsKey === undefined) return
  return  YelpRef.child(yelpResultsKey).once('value')
    .then(yelp => {
      let restaurantDetails = yelp.val()
      res.send(restaurantDetails)
    })
}

exports.FinalYelpResult = (req, res) => {
  getFinalResults(req.query.yelpKey, res)
}

let UsersRef = dbRef.child('users')
const getInvitees = (inviteeId, res) => {
  if (inviteeId === undefined) return
  return UsersRef.child(inviteeId).once('value')
    .then((guest) => {
      let guestDetails = guest.val()
      res.send(guestDetails)
    })
}

exports.getInvitee = (req, res) => {
  getInvitees(req.query.inviteeId, res)
}
