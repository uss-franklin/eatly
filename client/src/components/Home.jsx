import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './NavBar'

const Home = () => (
<div className="homePage">
      
      <div className="planMealButton">
          <button className="mealButton">
            <Link to="/inputForm" style={{ textDecoration: 'none'}}>Plan a Meal</Link>
          </button>  
      </div>
    
      	<div className="aboutMeSectionContainer"> 	
		    <div className="aboutMeSectionBackgroundImg1">
		      	<div className="generalInfoAppTextContainer">
		      		<h1 className="generalInfoAppTextHeader">
		      			Spend less time planning, more time eating!
		      		</h1>

		      		<p className="generalInfoAppText">
		      			All the scattered tasks of organizing a group outing has never been so easy. Avoid endless group chats and keeping track of everyone's personal preferences.
		      			At its core, Eatly is a place to plan group meals. Every guest gets to vote on the restaurants they most want to eat at, keeping the process fair and free of bother.
		      		</p>
		      	</div>
		    </div>
      
      		<div className="aboutMeSectionBackgroundImg2">
		      	<div className="basicFunctionalityGuidelineTextContainer">
		      		<h1 className="basicFunctionalityGuidelineTextHeader">
		      			Invite your friends, choose a cuisine type, general neighborhood, and date. Then the real fun begins...
		      		</h1>

		      		<p className="basicFunctionalityGuidelineText">
		      			Each guest gets a set number of votes from the pool of restaurants based on your tastes. We do all the vote counting, RSVPing, and contacting for you.
		      			When the cut off time has been reached, we count the votes, find the winning restaurant, then notify you and all your friends where you'll be meeting!
		      		</p>
		      	</div>
		    </div>

		    <div className = "aboutMeSectionBackgroundImg3">
		      	<div className="magicOfEatlyTextContainer">
		      		<div className="magicOfEatlyInnerContainer">
		      		<h1 className="magicOfEatlyTextHeader">
		      			Never waste time organizing nights out. 
		      			<h2 className="magicOfEatlyTextHeader2">
		      			Less planning, more eating!
		      			</h2>
		      		</h1>

		      		<p className="magicOfEatlyText">
		      			We at eatly keep track of all your friends and make it even easier to plan recurring events with the same groups.
		      			We cut the strife and any chance for messy drama by handling declined RSVP's, also by giving users the ability to "super like" restaurants they
		      			 most want to eat at, also the right to "veto" restaurants they'd HATE to eat at. Our amazing math robots take care of all the voting. They even randomly
		      			 	select restaurants when a tie-breaker is called for! Every meal is customizable and easy to edit. Emails and SMS messages are generated for all your friends
		      			 	when they're invited to your event, also when a winning restaurant has been selected. You won't be spending time in group chat hell ever again!
		      		</p>
		      		</div>
	      		</div>
	      	</div>

	      	
    	</div>


      <div className="planMealButton2">
          <button className="mealButton2">
            <Link to="/inputForm" style={{ textDecoration: 'none'}}>Plan a Meal</Link>
          </button>  
      </div>

</div>
)

export default Home;