import React from 'react'
import NavBar from './NavBar'

export default class Results extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="parent resultsComponent">
				<NavBar />
					<h1 className="resultsTitle">
						Congrats! You're Gonna Eat!
					</h1>
					<p className="resultsHeader">
						Get ready to meet your friends at:
					</p>
					<h2 className="resultsRestaurantTitle">
						[ Restaurant Name ]
					</h2>
					<h3 className="resultsDateAndTime">
						[ Date ] @ [ Time ]
					</h3>
					<p className="viewInviteeVotes">
						Want to see who you're gonna be dining with, and how they voted?
					</p>
					<button className="viewInviteesVotesButton">
						Guests
					</button>
					<p className="startNewMealTextResultsComponent">
						<br />
						<br />
						Get started planning another evening of fun!
					</p>
					<button className="startNewMealButtonResultsComponent">
						Plan Event
					</button>
			</div>
			)
	}
}

exports.Results = Results