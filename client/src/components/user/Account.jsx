import React from 'react'
import NavBar from '../NavBar'
import Axios from 'axios'
import EventEntry from './EventEntry'

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
      this.setState(Object.assign(userDetails.data, userEvents.data))
    }))
  }
  render() {
    let loading = 'loading...'
    let welcome = !this.state.name ? loading : `Welcome ${this.state.name}` 

    let hostEventEntires = this.state.hostEvents.map((event, idx) => <EventEntry event={event} vote={false} key={idx}/>)
    let hostEventsEntriesDOM = !this.state.hostEvents.length ? loading : hostEventEntires

    let invitedEventsEntries = this.state.invitedEvents.map((event, idx) => <EventEntry event={event} vote={true} key={idx}/>)
    let invitedEventsEntriesDOM = !this.state.invitedEvents.length ? loading : invitedEventsEntries
    
    return (
    <div className="Parent">
      <div className="usernameHeader">
        <h1>{welcome}</h1>
      </div>

      <div className="usersEvents">
        <h2 className="usersEventsTitle">
          Your Events
        </h2>
          <div> {hostEventsEntriesDOM} </div>
      </div>

      <div className="usersInvitedEvents">
        <h2 className="usersInvitedEventsTitle">
          Events You're Attending
        </h2>
        <div> {invitedEventsEntriesDOM} </div>
      </div>

    </div>
    )
  }
}