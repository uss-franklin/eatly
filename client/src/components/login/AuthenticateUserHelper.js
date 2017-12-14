import firebase from './FirebaseAuth'
import Axios from 'axios'

const postNewUser = (email, uid, name) => {
		Axios.post('/createAuthUser', {id: uid, emailAddress: email, name: name})
			.catch(err => console.log(err))
	}
const authenticateUser = function() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log('authenticateUser():true')
      console.log(user)
      //this route will always check if the user has already been created
      postNewUser(user.email, user.uid, user.displayName)
      this.setState({firebaseAuthenticatedUser: user}) 
    } else {
      console.log('authenticateUser(): false')
      //sets the state on the app to a logged outed
      this.setState({firebaseAuthenticatedUser: {uid: null}})
    }
  })
}

export default authenticateUser


