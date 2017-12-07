import React from 'react'
import NavBar from '../NavBar'
import Axios from 'axios'

export default class Account extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      hostEvents: [],
      invitedEvents: []
    }
  }
  componentDidMount() {
    console.log('account page user', this.props.user)
    Axios.get(`/getEvents?uid=${this.props.user.uid}`)
    .then(resp => {
      this.setState(resp.data, () => console.log(this.state))
    })
    .catch(err => console.log('error retrieving events: ', err))
  }
  render() {
    
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