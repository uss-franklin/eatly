
/*
this file takes care of all authentication through firebase.
the firebase script is hard-loaded into the index.html rather than using the node module
*/
import React from 'react'
import firebase from './FirebaseAuthKey'
import NavBar from '../NavBar'

export default class LoginForm extends React.Component {
	constructor() {
		super()
		this.state = {
			txtEmail: '',
			txtPassword: '',
			loggedIn: 'false',
		}
		this.authenticateUser.call(this)
	}
	handleInputChange({ target }) {
		this.setState({[target.name]: target.value})
	}
//handles log in event, bound to the log in button
	handleLogIn() {
		let { txtEmail, txtPassword } = this.state
		//firebase does the heavy lifting of valid email input verification
		firebase.auth().signInWithEmailAndPassword(txtEmail, txtPassword)
			.then((data) => console.log(data))
			.catch((error) => console.log('error in user login: ' +error.code+ " --" + error.message))
	}

//handles sign up event, bound to the sign up button
	handleSignUp() {
		let { txtEmail, txtPassword } = this.state
		//all users created this way are visible on the online firebase console
		firebase.auth().createUserWithEmailAndPassword(txtEmail, txtPassword)
			.then((data) => console.log(data))
			.catch((error) => console.log('error in user sign up: ' +error.code+ +"--"+ error.message))
	}

//removes the session token from the user, logs them out, bound to sign out button
	handleSignOut() {
		console.log('signing out - hopefully')
		firebase.auth().signOut()
			.then(() => console.log("logged out successfully"))
			.catch ((error) => console.log("sign out error: " + error))
	}

//real-time listener for any authentication state change, toggles state logged-in property accordingly
	authenticateUser(){
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				console.log('authenticateUser():true')
				this.setState({loggedIn: 'true'})
			} else {
				console.log('authenticateUser(): false')
				this.setState({loggedIn: 'false'})
			}
		})
	}

	render() {
		return (
			<div className="loginSignUpForm parent">
			<NavBar />
			<input id="txtEmail" name="txtEmail" type="email" placeholder="email" onChange={this.handleInputChange.bind(this)}></input>
			<input id="txtPassword" name="txtPassword" type="password" placeholder="password" onChange={this.handleInputChange.bind(this)}></input>
            	
			<div className="buttons">
					<button id="btnLogin" className="loginButton" onClick={this.handleLogIn.bind(this)}>Log In</button>
					<button id="btnSignUp" className="signupButton" onClick={this.handleSignUp.bind(this)}>Sign Up</button>
					<button id="btnLogout" className="logoutButton" onClick={this.handleSignOut.bind(this)}>Log out</button>
			</div>
		</div>
		)
	}
}