import React from 'react'

export default class loginSignUpForm extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div className="loginSignUpForm">
				<input id="txtEmail" type="email" placeholder="email">
            	<input id="txtPassword" type="password" placeholder="password">
            	
            	<div className="buttons">
                	<button id="btnLogin" className="btn btn-action">Log In</button>
                	<button id="btnSignUp" className="btn btn-secondary">Sign Up</button>
                	<button id="btnLogout" className="btn btn-action hide">Log out</button>
            	</div>
			</div>
		)
	}
}