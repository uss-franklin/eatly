import React from 'react'
import {ParallaxProvider, Parallax} from 'react-skrollr'

export default class GeneralInfoAppText extends React.Component {

	render() {
		return(
			<ParallaxProvider>
			<Parallax data={{
					'data-center-center': 'opacity: 1;',
					'data-bottom-top': 'opacity: 0;'
				}}
			>
				<div className="generalInfoAppTextContainer">
		      		
				<Parallax data={{
					'data-center-center': 'font-size: 1.4em',
					'data-bottom-top': 'font-size: 1em'
				}}
				>

		      		<h1 className="generalInfoAppTextHeader">
		      			Spend less time planning, more time eating!
		      		</h1>

		      	</Parallax> 

		      		<p className="generalInfoAppText">
		      			All the scattered tasks of organizing a group outing has never been easy. With Eatly, avoid endless group chats and keeping track of everyone's personal preferences.
		      			At its core, Eatly is a place to plan group meals. Every guest gets to vote on the restaurants they most want to eat at, keeping the process fair and free of bother.
		      		</p>
		      	</div>
		     </Parallax>
		     </ParallaxProvider>
		)
	}
}