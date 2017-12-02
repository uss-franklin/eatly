import React from 'react'
import {Link} from 'react-router-dom'

export default class NavBar extends React.Component {
  constructor(props) {
    super(props)
  }
  handleLogOut() {
    this.props.firebase.auth().signOut()
    .then(() => console.log("logged out successfully"))
    .catch ((error) => console.log("sign out error: " + error))
  }
  render() {
    //todo build out button for logout 
    return (
      <div className="parent">
        <div className="header"> 
        <Link to="/" style={{ textDecoration: 'none'}} className="navHeader"> eatly </Link> 
          <button className="login">
            <Link to="/loginForm" style={{ textDecoration: 'none'}}>login or sign up</Link>
          </button>
        </div>
      </div>
    )
  }
}