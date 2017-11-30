import React from 'react'
// import Location from './location_form/Location'

export default class App extends React.Component {
  constructor() {
    super()
  }

  planAMeal(){
    console.log('trigger event modal') //this will trigger the event modal view 
  }

  login() { //this will trigger the login/signup modal
    console.log('trigger login/sign up modal')
  }
  render() {
    return (
      <div className="parent">
        <div className="header"> 
          eatly
          <button className="login" onClick={() => this.login()}>login or sign up</button>
        </div>
        <div className="picture">
        <div className="title"><h1>Welcome to eatly</h1></div>
        <div className="planMealButton"><button className="mealButton" onClick={() => this.planAMeal()}>Plan a Meal</button></div>
        </div>
      </div>
    )
  }
}