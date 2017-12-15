const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

//for adding new guests to the event being edited
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

//for sending invites to added guests
const sendInviteEmail = require('./inviteEmailController.js').sendInviteEmail;

//Targets all entries in DB under events tree
const EventsRef = dbRef.child('events')
const UsersRef = dbRef.child('users')
const YelpRef = dbRef.child('yelpSearchResults')

const createUsersAndAddUsersToEvent = (eid, guestEmails, guestNames, yelpResultsCount) => {
	let yelpResultsVoteList = {}
		for (let i = 0; i < yelpResultsCount; i++) {
			yelpResultsVoteList[i] = '-'
	}
	return createGuestEmailUser(guestEmails, guestNames, eid, false)
	.then(userIds => {
		return Promise.all(userIds.map(uid => {
				console.log('Trying to update event: ', eid, 'with user: ',uid )
				return EventsRef.child(eid).child('eventInvitees').update({[uid]: yelpResultsVoteList})
		}))
	})
}

exports.editEvent = function(req, res) {
	console.log('updating event: ', req.body.eid)
	Promise.all(Object.keys(req.body.fieldsToUpdate).map(field => {
		console.log('trying to update field: ',field)
		if (field === 'yelpResultsCount') return
		if (field === 'newGuests') {
			let yelpResultsCount = req.body.fieldsToUpdate['yelpResultsCount']
			let newGuests = req.body.fieldsToUpdate['newGuests']
			return createUsersAndAddUsersToEvent(req.body.eid, newGuests[0], newGuests[1], yelpResultsCount)
		}
		if (field === 'voteCutOffDateTime') {
			req.body.fieldsToUpdate[field] = new Date(req.body.fieldsToUpdate[field]).toString()
		}
		return EventsRef.child(req.body.eid).update({[field]: req.body.fieldsToUpdate[field]})
					.then(() => console.log('successfully updated: ', {[field]: req.body.fieldsToUpdate[field]}))
					.catch((err) => console.log('error in updating event: ', req.body.eid,  err))
	}))
	.then(() => res.send(`Successfully Updated ${req.body.eid}`))
	.catch(err => 'Could not update event: ', req.body.eid)
}

const deleteUserEvent = (uid, eid, isHost) => {
	let userType = isHost ? 'hostEvents' : 'invitedEvents'
	console.log(uid, eid, userType)
	return UsersRef.child(uid).child(userType).once('value')
		.then(hostEvents => {
			let eventsArr = hostEvents.val().slice()
			eventsArr.splice(eventsArr.indexOf(eid), 1)
			return UsersRef.child(uid).child(userType).set(eventsArr)
	})
}

exports.deleteEvent = (req, res) => {
	console.log('deleting: ', req.query.eid)
	EventsRef.child(req.query.eid).remove() //remove event from events table
	.then(() => deleteUserEvent(req.query.uid, req.query.eid, true)) //delete event on host
	.then(() => Promise.all(req.query.inviteeuids.map(uid => deleteUserEvent(uid, req.query.eid, false)))) //delete event on invitees
	.then(() => YelpRef.child(req.query.yelpresultsid).remove())// delete yelp search results
	.then(() => res.end())
	.catch(err => console.log('error deleteing event', req.query.eid, err))
}
