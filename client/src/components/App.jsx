import React from 'react'
import Location from './location_form/Location'
import NavBar from './NavBar'
import {Link} from 'react-router-dom'
import LoginForm from './Login/LoginForm'

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }  

  render() {
    // console.log(this.props)
    return (
      <div className="parent">
          <NavBar />
        <div className="picture">
          <div className="title"><h1>Welcome to eatly</h1></div>
          <div className="planMealButton">
              <button className="mealButton">
                <Link to="/inputForm" style={{ textDecoration: 'none'}}>Plan a Meal</Link>
              </button>  
          </div>
        </div>
      </div>
    )
  }
}