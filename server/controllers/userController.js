const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('users');

const getUserDetails = (req, res) => {
  UsersRef.child(req.query.uid).once('value')
  .then(user => {
    userObj = user.val()
    delete userObj.hostEvents, userObj.invitedEvents
    res.send(userObj)
  })
}

const getGroupInvitedUsersDetails = (req, res) => {
  Promise.all(req.query.eventInvitees.map(uid => {
    return UsersRef.child(uid).once('value')
          .then(user => {
            let {name, email} = user.val()
            console.log(name, email)
            return {uid: uid, name: name || '', email: email}
          })
  }))
  .then(eventInviteesUsersDetails => res.send(eventInviteesUsersDetails))
}

//Creates user on signup using firebase auth 
const createAuthUser = (req, res) => {
  let {emailAddress, id, name} = req.body
  let userRef = UsersRef.child(id)
  userRef.once('value', user => {
    if (user.val() === null) {
      userRef.set({email: emailAddress, name: name})
      .then(() => {
        console.log('Successfully created Auth user', id)
        res.end()
      })
      .catch(err => console.log('Error creating auth user: ', err))
    } else {
      //user exists -- go home
      res.end()
    }
  })
}

//Creates user on filling out the input form
//Return a promise with the firebase user id
const createAnonUsers = (emailAddress, name, newEventKey, isHost) => {
  console.log('trying to create: ', emailAddress)
  return UsersRef.orderByChild('email').equalTo(emailAddress).once('value')
    .then(user => {
      // Create a new user if the user doesn't exist
      let hosting = isHost ? 'hostEvents' : 'invitedEvents'
      if (user.val() === null) {
        let newUserId = UsersRef.push()
        newUserId.set({email: emailAddress, [hosting]: [newEventKey], name: name})
        return newUserId.key
      } else  {
        //If the user exists then add the new event to thier firebaser object
        console.log(user.val())
        let userId = Object.keys(user.val())[0]
        let userObj = user.val()[userId]
        if (!userObj[hosting]) userObj[hosting]= [newEventKey]
        //this push is not a firebase method - plain old array push
        else userObj[hosting].push(newEventKey)
        //back to firebase methods 
        UsersRef.child(userId).set(userObj)
        return userId
      }
    })
} 

const createGuestEmailUser = (guestEmails, guestNames, newEventKey, isHost) => {
  let anonUsersPromise = []
  guestEmails.forEach((email, idx) => {
      anonUsersPromise.push(createAnonUsers(email, guestNames[idx], newEventKey, isHost))
  })
  return Promise.all(anonUsersPromise)
}
 
exports.getGroupInvitedUsersDetails = getGroupInvitedUsersDetails;
exports.createGuestEmailUser = createGuestEmailUser;
exports.createAnonUsers = createAnonUsers;
exports.createAuthUser = createAuthUser;
exports.getUserDetails = getUserDetails;


