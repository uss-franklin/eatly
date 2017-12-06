const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

const EventsRef = dbRef.child('events');

exports.editEvent = function(req, res) {
	EventsRef.orderByKey().equalTo(req.body.value).once('child_changed')
	  .then(event => {
	  	console.log("event edited! resulting changes to db : " + event)
	  })
}