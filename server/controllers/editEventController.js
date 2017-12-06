const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

const EventsRef = dbRef.child('events');

//pulls in the sent object that's assigned values from the edit event form component
//this function queries the DB for the event by its name, then sets new values to it
exports.editEvent = function(req, res) {
	EventsRef.orderByKey().equalTo(req.body.eventName).once('child_changed')
	  .then(event => {
	  	//TODO add in functionality for setting data to DB
	  	EventRef.set({${thing}: ${other thing}})
	  	console.log("event edited! resulting changes to db : " + event)
	  })
}