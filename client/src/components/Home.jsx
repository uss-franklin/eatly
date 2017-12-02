import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './NavBar'

const Home = () => (
    <div className="picture">
      <div className="title"><h1>Welcome to eatly</h1></div>
      <div className="planMealButton">
          <button className="mealButton">
            <Link to="/inputForm" style={{ textDecoration: 'none'}}>Plan a Meal</Link>
          </button>  
      </div>
    </div>
)

export default Home;