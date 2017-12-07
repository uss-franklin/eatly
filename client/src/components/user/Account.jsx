import React from 'react'
import NavBar from '../NavBar'
import Axios from 'axios'

export default class Account extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      email: '',
      name: '',
      hostEvents: [],
      invitedEvents: []
    }
  }
  getUserDetails() {
    return Axios.get(`/getUserDetails?uid=${this.props.user.uid}`)
  }
  getUserEvents() {
    return Axios.get(`/getEvents?uid=${this.props.user.uid}`)
  }
  componentDidMount() {
    Axios.all([
      this.getUserDetails(),
      this.getUserEvents()
    ])
    .then(Axios.spread((userDetails, userEvents) => {
      this.setState(userDetails.data)
    }))
  }
  render() {
    let welcome = !this.state.name ? 'loading...' : `Welcome ${this.state.name}` 
    return (
    <div className="Parent">
      <div className="usernameHeader">
        <h1>{welcome}</h1>
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