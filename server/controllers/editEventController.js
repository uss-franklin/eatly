const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

//for adding new guests to the event being edited
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

//Targets all entries in DB under events tree
const EventsRef = dbRef.child('events');
const UsersRef = dbRef.child('users')




/*TODO: REFACTOR THIS TO MIRROR THE WORKING VERSION BELOW
 	NEED TO PULL ID FIELD DOWN FROM STATE OF EDIT FORM COMPONENT
 	TO QUERY PARTICULAR EVENT IN THE EVENTS BUCKET OF DB
 */
// pulls in the sent object that's assigned values from the edit event form component
// this function queries the DB for the event by its name, then sets new values to it
// exports.editEvent = function(req, res) {
// 		EventsRef.child('id').update(req.body)
// 	.then(editedEvent => {
// 	 console.log('successfully changed event in DB')
// 	 res.end()
// 	})
// 	.catch((err) => console.log('error in logging to DB : ' + err))
// }




//THIS IMPLEMENTATION WORKS, BUT ONLY WITH DUMMY DATA
//SPECIFICALLY THE CHILD ID FIELD IS DRAWING FROM HARD COPY FROM DB
exports.editEvent = function(req, res) {
		EventsRef.child('-L-hHjkRMsleNYb-aBwS').update({eventName: req.body.eventName})
	.then(editedEvent => {
	 console.log('successfully changed event in DB')
	 Promise.resolve(editedEvent)
	})
	.catch((err) => console.log('error in logging to DB : ' + err))
};

exports.deleteEvent = (req, res) => {
	console.log('deleting: ', req.query.eid)
	res.end()
	EventsRef.child(req.query.eid).remove()
	.then(() => {
		UsersRef.child(req.query.uid).child('hostEvents').once('value')
		.then(hostEvents =>{
			let eventsArr = hostEvents.val().slice()
			eventsArr.splice(eventsArr.indexOf(req.query.eid), 1)
			UsersRef.child(req.query.uid).child('hostEvents').set(eventsArr)
			.then(res.end())
		})
		.catch(err => console.log('error deleteing event', req.query.eid, err ))
	})
	
}