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

    let logoutButton = <button className="login" onClick={this.handleSignOut.bind(this)}>Log out</button>
    let loginButton =  <button className="login">
                         <Link to="/loginForm" style={{ textDecoration: 'none'}}>login or sign up</Link>
                       </button>

    let accountButton = <button className="login">
                            <Link to="/account" style={{ textDecoration: 'none'}}>my account</Link>
                        </button>
    return (
      <div className="parent">
        <div className="header"> 
        <Link to="/" style={{ textDecoration: 'none'}} className="navHeader"> eatly </Link> 
          {loggedIn ? [logoutButton, accountButton] : loginButton}
        </div>
      </div>
    )
  }
}