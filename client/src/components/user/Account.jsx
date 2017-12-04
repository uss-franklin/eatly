import React from 'react'
import NavBar from '../NavBar'

export default class Account extends React.Component {
  constructor(props){
    super(props)
  }
  render() {
    console.log("account page user", this.props.user)
    return (
    <div className="Parent">
      <div className="usernameHeader">
        <h1>[your name here]</h1>
      </div>

      <div className="usersEvents">
        <h2 className="usersEventsTitle">
          Your Events
        </h2>
        <h3 className="usersEventItemTitle">
          [event name]
        </h3>
        <button className="editEventButton">
          Edit this event
        </button>
      </div>

      <div className="usersInvitedEvents">
        <h2 className="usersInvitedEventsTitle">
          Events You're Attending
        </h2>
        <h3 className="usersEventItemTitle">
          [event name]
        </h3>
        <button className="accountPageVisitEventButton">
          Vote
        </button>
      </div>

    </div>
    )
  }
}