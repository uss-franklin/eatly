
/*
this file takes care of all authentication through firebase.
the firebase script is hard-loaded into the index.html rather than using the node module
*/
import React from 'react'
import config from './FirebaseAuthKey'
import NavBar from './NavBar'


export default class LoginForm extends React.Component {
	constructor() {
		super()
		this.state = {
			loggedIn: 'false',
			firebase: firebase.initializeApp(config)
		}
		console.log(this)
	}

//handles log in event, bound to the log in button
	handleLogIn(event) {
		
		//binds text from input fields to these vars
		let email = document.getElementById('txtEmail').value
		let password = document.getElementById('txtPassword').value

		//firebase does the heavy lifting of valid email input verification
		this.state.firebase.auth().signInWithEmailAndPassword(email, password)
			.catch((error) => {
				console.log('error in user login: ' +error.code+ " --" + error.message)
			})
		this.setState({loggedIn: 'true'})
	}

//handles sign up event, bound to the sign up button
	handleSignUp(event) {

		//binds text from input fields to these vars
		let email = document.getElementById('txtEmail').value
		let password = document.getElementById('txtPassword').value

		//all users created this way are visible on the online firebase console
		this.state.firebase.auth().createUserWithEmailAndPassword(email, password)
			.catch((error) => {
				console.log('error in user sign up: ' +error.code+ +"--"+ error.message)
			})
	}

//removes the session token from the user, logs them out, bound to sign out button
	handleSignOut(event) {
		this.state.firebase.auth().signOut().then(function() {
			console.log("logged out successfully")
		}).catch (function(error) {
			console.log("sign out error: " + error)
		})
	}

//real-time listener for any authentication state change, toggles state logged-in property accordingly
	authenticateUser(x){
		// firebase.initializeApp(config);
		this.state.firebase.auth().onAuthStateChanged(function(user) {
			if(user){
				console.log('authenticateUser():true')
				this.setState({loggedIn: 'true'})
			} else {
				console.log('authenticateUser(): false')
				this.setState({loggedIn: 'false'})
			}
		}.bind(this))
	}

	render() {
		return (
			<div className="loginSignUpForm parent">
			<NavBar />
				<input id="txtEmail" type="email" placeholder="email"></input>
            	<input id="txtPassword" type="password" placeholder="password"></input>
            	
            	<div className="buttons">
                	<button id="btnLogin" className="loginButton" onClick={this.handleLogIn.bind(this)}>Log In</button>
                	<button id="btnSignUp" className="signupButton" onClick={this.handleSignUp.bind(this)}>Sign Up</button>
                	<button id="btnLogout" className="logoutButton">Log out</button>
            	</div>
            </div>
		)
	}
}