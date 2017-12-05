const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

const UsersRef = dbRef.child('Users');

const createUsers = (emailAddress, firebaseId) => {
  if (firebaseId === null) {
    console.log('here')
    let newUserId = UsersRef.push()
    console.log('creating user: ', emailAddress)
    newUserId.set({email: emailAddress})
    return newUserId.key
  }
  return UsersRef.child(firebaseId).once('value')
    .then((user) => {
        if (user.val() === null && firebaseId !== 'null') {
          console.log(user.val())
          console.log('creating user: ', emailAddress)
          let firebaseUser = UsersRef.child(firebaseId)
          firebaseUser.set({email: emailAddress})
          console.log(firebaseUser.key)
          return firebaseUser.key
        } else {
          console.log('user exists: ', user.val())
          return firebaseId
        }
      }
    )

} 
// createUsers('anothertest@gmail.com', 'YyjnfBf0nJbebYWJtEGUsuJdo803')

module.exports.createUsers = createUsers;


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

