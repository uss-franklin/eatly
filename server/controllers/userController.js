const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('users');

//Creates user on signup using firebase auth 
const createAuthUser = (req, res) => {
  let {emailAddress, id} = req.body
  UsersRef.child(id).set({email: emailAddress})
    .then(() => console.log('Successfully created user', id))
    .catch(err => console.log('Erro creating auth user: ', err))
}

//Creates user on filling out the input form
//Return a promise with the firebase user id
const createAnonUsers = (emailAddress) => {
  return UsersRef.orderByChild('email').equalTo(emailAddress).once('value')
    .then(user => {
      if (user.val() === null) {
        let newUserId = UsersRef.push()
        newUserId.set({email: emailAddress})
        return newUserId.key
      } else  {
        return Object.keys(user.val())[0]
      }
    })
} 

const createGuestEmailUser = (guestEmails) => {
  let anonUsersPromise = []
  guestEmails.forEach((email) => {
      anonUsersPromise.push(createAnonUsers(email))
  })
  return Promise.all(anonUsersPromise)
}
 
module.exports.createGuestEmailUser = createGuestEmailUser;
module.exports.createAnonUsers = createAnonUsers;
module.exports.createAuthUser = createAuthUser;


