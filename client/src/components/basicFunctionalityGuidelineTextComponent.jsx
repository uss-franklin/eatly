import React from 'react'
import {ParallaxProvider, Parallax} from 'react-skrollr'

export default class BasicFunctionalityGuidelineText extends React.Component {

	render() {
		return(
			<ParallaxProvider>
			<Parallax data={{
					'data-center-center': 'opacity: 1;',
					'data-bottom-top': 'opacity: 0;'
				}}
			>
				<div className="basicFunctionalityGuidelineTextContainer">
		      		
				<Parallax data={{
					'data-center-center': 'font-size: 1.6em',
					'data-bottom-top': 'font-size: 1em'
				}}
				>
		      		<h1 className="basicFunctionalityGuidelineTextHeader">
		      			Invite your friends, choose a cuisine type, neighborhood, and date. Then the real fun begins...
		      		</h1>
		      	</Parallax>

		      		<p className="basicFunctionalityGuidelineText">
		      			Each guest gets a set number of votes from the pool of restaurants based on your tastes. We do all the vote counting, RSVPing, and contacting for you.
		      			When the cut off time has been reached, we count the votes, find the winning restaurant, then notify you and all your friends where you'll be meeting!
		      		</p>
		      	</div>
		     </Parallax>
		     </ParallaxProvider>
		)
	}
}