import React from 'react'
import {Link} from 'react-router-dom'

export default class NavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <div className="header"> 
          eatly
          <button className="login">
            <Link to="/LoginForm" style={{ textDecoration: 'none'}}>login or sign up</Link>
          </button>
        </div>
      </div>
    )
  }
}