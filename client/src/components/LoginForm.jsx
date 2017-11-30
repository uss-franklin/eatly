import React from 'react'
import {ref, firebaseAuth} from '../../../server/keys/firebaseAuthConfig.js'




export default class LoginForm extends React.Component {
	constructor() {
		super()
	}


//all buttons' functionality defined in the firebaseAuth.js file in server directory
	render() {
		return (
			<div className="loginSignUpForm">
				<input id="txtEmail" type="email" placeholder="email"></input>
            	<input id="txtPassword" type="password" placeholder="password"></input>
            	
            	<div className="buttons">
                	<button id="btnLogin" className="loginButton">Log In</button>
                	<button id="btnSignUp" className="signupButton">Sign Up</button>
                	<button id="btnLogout" className="logoutButton">Log out</button>
            	</div>
            </div>
		)
	}
}