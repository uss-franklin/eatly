const dbRef = require('../db/firebaseRealtimeDB.js').dbRef;

let anonUsersRef = dbRef.child('anonUsers');

//Process non-authenticated users
const anonUsers = (userToCheckorCreate) => {
  let fireBaseUserId; //capture the user id of a user whether are created or exist 
  anonUsersRef.orderByChild('email').equalTo(userToCheckorCreate).once('value')
  .then(user => {
    if (user.val()) { 
      fireBaseUserId = Object.keys(user.val())[0] 
      console.log('user exists')
    } else {
      let fireBaseUserId = anonUsersRef.push()
      fireBaseUserId.set({email: userToCheckorCreate})
      .then(() => console.log('Creating user with id: ', fireBaseUserId.key))
    }
  })
}

module.exports.addUser = (req, res) => {
  console.log(req.body)
}

//Process authenticated users and thier data to the auth users table



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

