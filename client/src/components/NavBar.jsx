import React from 'react'
import {Link} from 'react-router-dom'

export default class NavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="parent">
        <div className="header"> 
        <Link to="/" style={{ textDecoration: 'none'}} className="navHeader"> eatly </Link> 
          <button className="login">
            <Link to="/LoginForm" style={{ textDecoration: 'none'}}>login or sign up</Link>
          </button>
        </div>
      </div>
    )
  }
}