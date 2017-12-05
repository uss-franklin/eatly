const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('Users');

//Creates user on signup using firebase auth 
const createAuthUser = (req, res) => {
  let {emailAddress, id} = req.body
  UsersRef.child(id).set({email: emailAddress})
    .then(() => console.log('Successfully created user'))
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

// return UsersRef.child(firebaseId).once('value')
//   .then((user) => {
//       if (user.val() === null && firebaseId !== 'null') {
//         console.log(user.val())
//         console.log('creating user: ', emailAddress)
//         let firebaseUser = UsersRef.child(firebaseId)
//         firebaseUser.set({email: emailAddress})
//         console.log(firebaseUser.key)
//         return firebaseUser.key
//       } else {
//         console.log('user exists: ', user.val())
//         return firebaseId
//       }
//     }
//   )
// const anonUsers = (userToCheckorCreate, firebaseId) => {
//   let fireBaseUserId; //capture the user id of a user whether are created or exist 
//   anonUsersRef.orderByChild('email').equalTo(userToCheckorCreate).once('value')
//   .then(user => {
//     if (user.val()) { 
//       fireBaseUserId = Object.keys(user.val())[0] 
//       console.log('user exists')
//     } else {
//       let fireBaseUserId = anonUsersRef.push()
//       fireBaseUserId.set({email: userToCheckorCreate})
//       .then(() => console.log('Creating user with id: ', fireBaseUserId.key))
//     }
//   })
// }






// anonUsersRef.orderByKey().once('value')
//   .then(usersSnap => 
//     usersSnap.forEach(user => {
//       //check if the user exits and create them if they don't
//       if (user.val().email === emailToCheck) { return console.log(user.key) }

      
//     } 
//   ))
  //get all of the users
  // .then(usersSnapshot => 
  //   usersSnapshot.forEach(userSnapshot => {
  //     console.log(userSnapshot.key)
  //     console.log(userSnapshot.val())
  //   })
  // )

