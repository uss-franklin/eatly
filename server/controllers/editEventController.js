const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

//for adding new guests to the event being edited
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

//Targets all entries in DB under events tree
const EventsRef = dbRef.child('events');

//pulls in the sent object that's assigned values from the edit event form component
//this function queries the DB for the event by its name, then sets new values to it
exports.editEvent = function(req, res) {
	EventsRef.orderByKey().equalTo(req.body.eventName).once('child_changed')
	  .then(event => {
	  	//TODO add in functionality for setting data to DB
	  	EventRef.set({ })
	  	console.log("event edited! resulting changes to db : " + event)
	  })
}