import firebase from './FirebaseAuth'

const authenticateUser = function() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log('authenticateUser():true')
      console.log(user)
      this.setState({firebaseAuthenticatedUser: user}) 
    } else {
      console.log('authenticateUser(): false')
      //sets the state on the app to a logged outed
      this.setState({firebaseAuthenticatedUser: {uid: null}})
    }
  })
}

export default authenticateUser


