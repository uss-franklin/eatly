const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
var sendDeleteEventEmail = require('./deleteEventEmail.js').sendDeleteEventEmail;

//for adding new guests to the event being edited
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

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

	/*
		Following lines of code parse through necessary data for sending notifications to guests
		that the event they're invited to has been deleted.
	*/
	
	//declares variables to populate with relevant event data, then pass into invocation of send email function
	let eventId = req.query.eid
	let hostId = req.query.uid
	console.log("HOST ID IN DELETE EVENT FUNC : " + hostId)
	console.log("EVENT ID IN DELETE EVENT FUNC : " + eventId)
	let guestIds, hostName, eventName

	//queries the DB for relevant data to pass into vars declared above
	Promise.all([

		//plucks hostName from the DB
		UsersRef.child(hostId).child('name').once('value').then((nameResult) => {
				nameResult = nameResult.val()
				console.log("RESULTING HOST NAME FROM THE HOST ID IN PROMISES CHAIN : " +nameResult)
				return nameResult
			}).catch((err) => console.log("Error finding hostname from DB in sending deleted event notifications function :", err)),

		//plucks the eventName from the DB
		EventsRef.child(eventId).child('eventName').once('value').then((eventNameResult) => {
			eventNameResult = eventNameResult.val()
			console.log("EVENT NAME IN PROMISES CHAIN : ", eventNameResult)
			return eventNameResult
		}).catch((err) => console.log("Error finding eventName from DB in sending deleted event notifications function :", err)),

		//plucks guest Id's from the DB
		EventsRef.child(eventId).child('eventInvitees').once('value').then((resultInvitees) => {
			resultInvitees = resultInvitees.val()
			console.log("RESULT INVITEES LINE 93 === ", resultInvitees)
			console.log("OBJECT KEYS OF RESULT INVITEES LINE 93 ===", Object.keys(resultInvitees))
			resultInvitees = Object.keys(resultInvitees)
			return resultInvitees
		}).catch((err) => console.log("Error finding guest Id's from DB in  sending deleted event notifications function :", err))
	]).then((resolvedArray) => {
		//sets the resolved values of each promise to the variables declared above
		guestIds = resolvedArray[2]
		eventName = resolvedArray[1]
		hostName = resolvedArray[0]

		//iterates through each userId to send an email to each guest
		guestIds.forEach((userId) => {
			UsersRef.child(userId).child('email').once('value').then((result) => {
				let guestEmail = result.val()
				sendDeleteEventEmail(guestEmail, hostName, eventName)
				return console.log('deleted event notification send to : ' + guestEmail)
			})
		})
	}).then(() => {

	EventsRef.child(req.query.eid).remove() //remove event from events table
	.then(() => deleteUserEvent(req.query.uid, req.query.eid, true)) //delete event on host
	.then(() => Promise.all(req.query.inviteeuids.map(uid => deleteUserEvent(uid, req.query.eid, false)))) //delete event on invitees
	.then(() => YelpRef.child(req.query.yelpresultsid).remove())// delete yelp search results
	.then(() => res.end())
	.catch(err => console.log('error deleteing event', req.query.eid, err))

	})
}
