import React from 'react'
import NavBar from '../NavBar'

export default class EditEvent extends React.Component {
	constructor(props){
		super(props)
	}

	render() {
		return(
			<div className="editEventFormComponent parent">

				<NavBar />
				
				<div className="editEventTitleDiv">
					<h1 className="currentEventTitle">
						[event title]
					</h1>
					<input type="text" className="editEventTitleInput" placeholder="new title"></input>
				</div>

				<div className="editEventTimeDiv">
					<h2 className="currentEventTime">
						[event time]
					</h2>
					<input type="text" className="editEventTimeInput" placeholder="new event time"></input>
				</div>

				<div className="editEventCutoffTimeDiv">
					<h2 className="currentEventCutoffTime">
						[event cut off time]
					</h2>
					<input type="text" className="editEventCutoffTimeInput" placeholder="new event cut off time"></input>
				</div>

				<button className="addRemoveGuestsButton">
					Add / Remove Guests
				</button>

				<button className="saveChangesEditEventButton">
					Save Changes
				</button>

				<button className="deleteEventButton">
					Delete Event
				</button>
			</div>
		)
	}
}