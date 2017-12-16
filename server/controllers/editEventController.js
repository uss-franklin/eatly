const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;
var sendDeleteEventEmail = require('./deleteEventEmail.js').sendDeleteEventEmail;

//for adding new guests to the event being edited
const createAnonUsers = require('./userController.js').createAnonUsers;
const createGuestEmailUser = require('./userController.js').createGuestEmailUser;

//Targets all entries in DB under events tree
const EventsRef = dbRef.child('events')
const UsersRef = dbRef.child('users')
const YelpRef = dbRef.child('yelpSearchResults')

//for sending invite emails to all new guests
const sendInviteEmail = require('./inviteEmailController.js').sendInviteEmail

const createUsersAndAddUsersToEvent = (eid, guestEmails, guestNames, yelpResultsCount) => {
	let yelpResultsVoteList = {}
		for (let i = 0; i < yelpResultsCount; i++) {
			yelpResultsVoteList[i] = '-'
	}
	let userVoteObj = {
		votes: yelpResultsVoteList,
		specialVotes: {
			hasSuperLiked: false,
			hasVetoed: false
		}
	}
	return createGuestEmailUser(guestEmails, guestNames, eid, false)
	.then(userIds => {
		return Promise.all(userIds.map(uid => {
				// console.log('Trying to update event: ', eid, 'with user: ', uid )
				return EventsRef.child(eid).child('eventInvitees').update({[uid]: userVoteObj})
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
	.then(() => {
		//sends invite emails to all new guests 
		//declare variables
		let hostName, eventDate, eventName
		let eventId = req.body.eid
		let newUsersEmails = []

		console.log('beginning to send emails to new users')
		
		//populates array with all new users emails
		if(req.body.fieldsToUpdate.newGuests){
			req.body.fieldsToUpdate.newGuests[0].forEach((email) => {
				newUsersEmails.push(email)
			})
			console.log('new users emails array : ', newUsersEmails)
		}


		//run promise chain to populate these with values
		Promise.all([
			//plucks hostName from the DB
			EventsRef.child(eventId).child('eventHost').once('value').then((result) => {
				result = Object.keys(result.val())[0]
				var innerPromise = UsersRef.child(result).child('name').once('value').then((nameResult) => {
					nameResult = nameResult.val()
					return nameResult
				})
				return innerPromise
			}).catch((err) => console.log('error in retrieving hostname for sending new guests email invites : ', err)),

			//plucks event date and time from the DB
			EventsRef.child(eventId).child('eventDateTime').once('value').then((dateResult) => {
				dateResult = dateResult.val()
				return dateResult
			}).catch((err) => console.log('error in retrieving event date and time for sending new guests email invites: ', err)),

			//plucks the event name from the DB
			EventsRef.child(eventId).child('eventName').once('value').then((eventNameResult) => {
				eventNameResult = eventNameResult.val()
				return eventNameResult
			}).catch((err) => console.log('error in retrieving event name for sending new guests email invites : ', err))
		]).then((resolvedArrayEventChunks) => {
			hostName = resolvedArrayEventChunks[0]
			eventDate = resolvedArrayEventChunks[1]
			eventName = resolvedArrayEventChunks[2]

			console.log("after the promise chain, gonna start looping through emails")

			//loop through each of the new users emails
			newUsersEmails.forEach((email) => {
				//check event invitees keys in event on DB
				EventsRef.child(eventId).child('eventInvitees').once('value').then((resultInvitees) => {
					resultInvitees = Object.keys(resultInvitees.val())
					console.log("resultInvitees inside newUsersEmails looping :", resultInvitees)
					resultInvitees.forEach((key) => {
						console.log("specific user key on instance of loop :", key)
						UsersRef.child(key).child('email').once('value').then((resultEmail) => {
							resultEmail = resultEmail.val()
							console.log("result email for matching key : ", resultEmail)
							if(resultEmail === email) {
								sendInviteEmail(email, hostName, eventDate, eventName, key, eventId)
							}
						})
					})
				})
			})

		})
	})
	.then(() => res.send(`Successfully Updated ${req.body.eid}`))
	.catch(err => 'Could not update event: ', req.body.eid)
}

const deleteUserEvent = (uid, eid, isHost) => {
	let userType = isHost ? 'hostEvents' : 'invitedEvents'
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
