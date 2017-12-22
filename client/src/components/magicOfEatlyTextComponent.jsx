import React from 'react'
import {ParallaxProvider, Parallax} from 'react-skrollr'
import { Link } from 'react-router-dom'

export default class MagicOfEatlyText extends React.Component {

	render() {
		return(
			<ParallaxProvider>
			<Parallax data={{
					'data-center-center': 'opacity: 1;',
					'data-bottom-top': 'opacity: 0;'
				}}
			>
				<div className="magicOfEatlyTextContainer">
		      		<div className="magicOfEatlyInnerContainer">
		      		<h1 className="magicOfEatlyTextHeader">
		      			Never waste time organizing nights out. 
		      			
		      			<Parallax data={{
		      				'data-center-center': 'font-size: 1.7em',
							'data-bottom-top': 'font-size: 1em'
		      			}}
		      			>

		      			<h2 className="magicOfEatlyTextHeader2">
		      			Less planning, more eating!
		      			</h2>

		      			</Parallax>

		      		</h1>

		      		<p className="magicOfEatlyText">
		      			We at eatly keep track of all your friends and make it even easier to plan recurring events with the same groups.
		      			We cut the strife and any chance for messy drama by handling declined RSVP's, also by giving users the ability to "super like" restaurants they
		      			 most want to eat at and the right to "veto" restaurants they'd HATE to eat at. Our amazing math robots take care of all the voting. They even randomly
		      			 	select restaurants when a tie-breaker is called for! Every meal is customizable and easy to edit. Emails and SMS messages are generated for all your friends
		      			 	when they're invited to your event, and again when a winning restaurant has been selected. You won't be spending time in tedious group chats about dinner ever again!
		      		</p>
		      		</div>


		      		<div className="planMealButton2">
				        <button className="mealButton2">
				        	<Link to="/inputForm" style={{ textDecoration: 'none'}}>Plan a Meal</Link>
				        </button>  
				     </div>

	      		</div>
		     </Parallax>
		     </ParallaxProvider>
		)
	}
}