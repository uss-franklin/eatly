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
    
      <div className="aboutMeSectionContainer"> 	
      
      	<div className="generalInfoAppTextContainer">
      		<h1 className="generalInfoAppTextHeader">
      		</h1>

      		<p className="generalInfoAppText">
      		</p>
      	</div>
      
      	<div className="basicFunctionalityGuidelineTextContainer">
      		<h1 className="basicFunctionalityGuidelineTextHeader">
      		</h1>

      		<p className="basicFunctionalityGuidelineText">
      		</p>
      	</div>

      	<div className="magicOfEatlyTextContainer">
      		<h1 className="magicOfEatlyTextHeader">
      		</h1>

      		<p className="magicOfEatlyText">
      		</p>
      	</div>
      
      </div>



    </div>
)

export default Home;