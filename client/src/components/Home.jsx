import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './NavBar'
import {ParallaxProvider, Parallax} from 'react-skrollr'
import GeneralInfoAppText from './generalInfoAppTextComponent'
import BasicFunctionalityGuidelineText from './basicFunctionalityGuidelineTextComponent'
import MagicOfEatlyText from './magicOfEatlyTextComponent'

const Home = () => (

	<div className="homePage parent">
	      
	      <div className="planMealButton">
	          <button className="mealButton">
	            <Link to="/inputForm" style={{ textDecoration: 'none'}}>Plan a Meal</Link>
	          </button>  
	      </div>
	    
	      	<div className="aboutMeSectionContainer"> 	
			    
			    <GeneralInfoAppText />

	      
			    <BasicFunctionalityGuidelineText />

			    <MagicOfEatlyText />


	    	</div>

	</div>
)

export default Home;