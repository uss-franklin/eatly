const dbRef = require('../db/firebaseRealtimeDB.js').dbRef
let YelpRef = dbRef.child('yelpSearchResults')
let eventsRef = dbRef.child('events')

const getFinalResults = (yelpResultsKey, res) => {
  if (yelpResultsKey === undefined) return
  return  YelpRef.child(yelpResultsKey).once('value')
    .then(yelp => {
      let restaurantDetails = yelp.val()
      // console.log('restdetails', restaurantDetails)
      res.send(restaurantDetails)
    })
}

exports.FinalYelpResult = (req, res) => {
  getFinalResults(req.query.yelpKey, res)
}
