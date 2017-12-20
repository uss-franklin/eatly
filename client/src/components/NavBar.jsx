import React from 'react'
import {Link} from 'react-router-dom'

export default class NavBar extends React.Component {
  constructor(props) {
    super(props)
    this.firebase = this.props.firebase
  }
//removes the session token from the user, logs them out, bound to sign out button
  handleSignOut() {
    console.log('signing out - hopefully')
    this.firebase.auth().signOut()
      .then(() => console.log("logged out successfully"))
      .catch ((error) => console.log("sign out error: " + error))
  }
  render() {
    let loggedIn = this.props.loggedIn
    let logoutButton = <button className="logout button is-link" onClick={this.handleSignOut.bind(this)} key="logout">logout</button>
    let loginButton =  <Link to="/loginForm" ><button className="login button is-link" key="login">
                         login or sign up
                       </button></Link>

    let accountButton = <Link to="/account"><button className="account button is-link" key="account">
                            my account
                        </button></Link>
    rreturn (
      <div className="parent">
        <div className="header is-clearfix"> 
        <div className="is-pulled-left">
          <Link to="/" style={{ textDecoration: 'none'}} className="navHeader"> <img src="./images/LogoonRed.png"/></Link>
        </div>
          <div className="account-login is-pulled-right">
            {loggedIn ? [accountButton, logoutButton] : loginButton}
          </div>
        </div>
      </div>
    )
  }
}