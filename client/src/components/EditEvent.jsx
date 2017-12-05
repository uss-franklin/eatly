import React from 'react'
import NavBar from './NavBar'

export default class EditEvent extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return(
			<div className="parent editEventComponent">

				<NavBar />

				<div className="editEventForm">

					<h1 className="editEventFormHeader">Edit [eventName]</h1>

					<div className="editEventTitleDiv">
						<p className="editEventFormCurrentTitle">
						[current title]
						<input className="editEventTitleInput" placeholder="New Title"></input>
						</p>
					</div>

					<div className="editEventTimeDiv">
						<p className="editEventFormCurrentTime">
						[current event time]
						<input className="editEventTimeInput" placeholder="New Time"></input>
						</p>
					</div>

					<div className="editEventCutoffTimeDiv">
						<p className="editEventFormCutoffTime">
						[current event cut off time]
						<input className="editEventCutoffTimeInput" placeholder="New Cut Off Time"></input>
						</p>
					</div>

					<div className="addRemoveGuestsButton">
						<button>Add/Remove Guests</button>
					</div>

					<button className="deleteEventButton">Delete Event</button>
				</div>
			</div>
		)
	}
}