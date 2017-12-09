const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('users');

const getUserDetails  = (req, res) => {
  UsersRef.child(req.query.uid).once('value')
  .then(user => {
    userObj = user.val()
    delete userObj.hostEvents, userObj.invitedEvents
    res.send(userObj)
  })
}

//Creates user on signup using firebase auth 
const createAuthUser = (req, res) => {
  let {emailAddress, id, name} = req.body
  let userRef = UsersRef.child(id)
  userRef.set({email: emailAddress, name: name})
    .then(() => console.log('Successfully created Auth user', id))
    .catch(err => console.log('Error creating auth user: ', err))
}

//Creates user on filling out the input form
//Return a promise with the firebase user id
const createAnonUsers = (emailAddress, newEventKey, isHost) => {
  return UsersRef.orderByChild('email').equalTo(emailAddress).once('value')
    .then(user => {
      // pass in the property to write the new event key hosting vs invitedEvents list
      let hosting = isHost ? 'hostEvents' : 'invitedEvents'
      if (user.val() === null) {
        let newUserId = UsersRef.push()
        newUserId.set({email: emailAddress, [hosting]: [newEventKey]})
        return newUserId.key
      } else  {
        //turning the firebase snapshot into plan js object to modify it
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

const createGuestEmailUser = (guestEmails, newEventKey, isHost) => {
  let anonUsersPromise = []
  guestEmails.forEach((email) => {
      anonUsersPromise.push(createAnonUsers(email, newEventKey, isHost))
  })
  return Promise.all(anonUsersPromise)
}
 
exports.createGuestEmailUser = createGuestEmailUser;
exports.createAnonUsers = createAnonUsers;
exports.createAuthUser = createAuthUser;
exports.getUserDetails = getUserDetails;


