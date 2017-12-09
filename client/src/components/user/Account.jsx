import React from 'react'
import NavBar from '../NavBar'
import Axios from 'axios'
import EventEntry from './EventEntry'
import moment from 'moment'

export default class Account extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      email: '',
      name: '',
      hostEvents: [],
      invitedEvents: [],
      hostEventsIds: [],
      invitedEventsIds: []
    }
  }
  getUserDetails() {
    return Axios.get(`/getUserDetails?uid=${this.props.user.uid}`)
  }
  getUserEvents() {
    return Axios.get(`/getEvents?uid=${this.props.user.uid}`)
  }
  makeCutOffTimeMoment(event){
    //Thu Dec 07 2017 13:29:00 GMT-0500
    let cutOffDateArr = event.voteCutOffDateTime.split(' ')
    let cutOfftimeArr = cutOffDateArr[4].split(':')
    event.voteCutOffDateTimeMoment = moment()
    .month(cutOffDateArr[1])
    .date(cutOffDateArr[2])
    .hour(cutOfftimeArr[0])
    .minute(cutOfftimeArr[1])
    .second(cutOfftimeArr[2])
    event.sortBy = event.voteCutOffDateTimeMoment.unix()
  }
  processData(userData, eventsData){
    //Update and sort all event details
    eventsData.hostEvents.forEach(event => this.makeCutOffTimeMoment(event))
    eventsData.hostEvents.sort((a, b) => b.sortBy - a.sortBy)
    eventsData.invitedEvents.forEach(event => this.makeCutOffTimeMoment(event))
    eventsData.invitedEvents.sort((a, b) => b.sortBy - a.sortBy)

    this.setState(Object.assign(userData, eventsData), () => console.log(this.state))
  }
  componentDidMount() {
    Axios.all([
      this.getUserDetails(),
      this.getUserEvents()
    ])
    .then(Axios.spread((userDetails, userEvents) => {
      console.log(userEvents.data)
      this.processData(userDetails.data, userEvents.data)
    }))
  }
  handleVoteButtonClick(eventId, userId){
    window.location = `/swipe?eventKey=${eventId}&userId=${userId}`
  }
  render() {
    let loading = 'loading...'
    let welcome = !this.state.name ? loading : `Welcome ${this.state.name}` 

    let hostEventEntires = this.state.hostEvents.map(
      (event, idx) => 
        <EventEntry 
          event={event} 
          vote={false} 
          key={idx} 
          uid={this.props.user.uid} />
      )
    let hostEventsEntriesDOM = !this.state.hostEvents.length ? loading : hostEventEntires

    let invitedEventsEntries = this.state.invitedEvents.map(
      (event, idx) => 
        <EventEntry 
          event={event} 
          vote={true} 
          key={idx} 
          uid={this.props.user.uid} 
          buttonAction={this.handleVoteButtonClick}/>
      )
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
          <table> 
          <tr>
            <th>Name</th>
            <th>Cuisine</th>
            <th>Time left</th>
            <th></th>
          </tr>
          {hostEventsEntriesDOM} 
          </table>
      </div>
      <div className="usersInvitedEvents">
        <h2 className="usersInvitedEventsTitle">
          Events You're Attending
        </h2>
        <table> 
          <tr>
            <th>Name</th>
            <th>Cuisine</th>
            <th>Time left</th>
            <th></th>
          </tr>
          {invitedEventsEntriesDOM} 
        </table>
      </div>

    </div>
    )
  }
}