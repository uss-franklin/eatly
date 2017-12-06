const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

const eventsRef = dbRef.child('events');

exports.editEvent = function(req, res) {
	
}