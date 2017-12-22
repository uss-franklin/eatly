import React from 'react'
import { Link } from 'react-router-dom'
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
      invitedEventsIds: [],
      dataFetched: false
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
    this.setState(Object.assign(userData, eventsData, {dataFetched : true}), ()=> {
        console.log(this.state);
    })

  }
  componentDidMount() {
    Axios.all([
      this.getUserDetails(),
      this.getUserEvents()
    ])
    .then(Axios.spread((userDetails, userEvents) => {
      //console.log('USER DETAILS: ', userDetails.data);
      this.processData(userDetails.data, userEvents.data)
    })).catch(() => {
        console.log('This page is not loading because there is something wrong with the get requests')
    })
  }
  handleVoteOrEditButton(page, eventId, userId){
    let addUser = page === 'swipe' ? `&userId=${userId}` : ' '
    window.location = `/${page}?eventKey=${eventId}${addUser}`
  }
  render() {
    let loading = 'loading...'
    let welcome = !this.state.name ? loading : `Welcome ${this.state.name}` 

    let hostEventEntires = this.state.hostEvents.map(
      (event, idx) => 
        <EventEntry 
          event={event} 
          canEdit={true} 
          key={idx} 
          uid={this.props.user.uid} 
          buttonAction={this.handleVoteOrEditButton}
        />
      )
    let hostEventsEntriesDOM = !this.state.hostEvents.length ? loading : hostEventEntires

    let invitedEventsEntries = this.state.invitedEvents.map(
      (event, idx) => 
        <EventEntry 
          event={event} 
          canEdit={false} 
          key={'invited' + idx} 
          uid={this.props.user.uid} 
          buttonAction={this.handleVoteOrEditButton}
        />
      )
    let invitedEventsEntriesDOM = !this.state.invitedEvents.length ? loading : invitedEventsEntries
    if (this.state.dataFetched && !this.state.invitedEvents.length) invitedEventsEntriesDOM = []
    if (this.state.dataFetched && !this.state.hostEvents.length) hostEventsEntriesDOM = []
    return (
        <div>
          <h1 className="title">{welcome}</h1>
          <div className="centered">
            <a className="button accountPlanMealButton" onClick={() => {window.location = `/InputForm`}} >
                Plan a Meal
            </a>
          </div>
          <br/>
          <div className="card cardFormat">
            <header className="card-header accountHostTable">
              <p className="card-header-title accountHostTableText">
                  Your Events
              </p>
            </header>
            <div className="card-content">
              <div className="content">
                <table className="table">
                  <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cuisine</th>
                    <th>Time Left</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                    {hostEventsEntriesDOM}
                  </tbody>
                </table>
                  {hostEventsEntriesDOM.length === 0 ? <span> C'mon, get some eats with your pals. Click the button above</span> : <span></span>}
              </div>
            </div>
          </div>
          <div className="card cardFormat">
            <header className="card-header accountHostTable">
              <p className="card-header-title accountHostTableText">
                  Events You're Attending
              </p>
            </header>
            <div className="card-content">
              <div className="content">
                  <table className="table">
                      <thead>
                      <tr>
                          <th>Name</th>
                          <th>Cuisine</th>
                          <th>Time Left</th>
                          <th>Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {invitedEventsEntriesDOM}
                      </tbody>
                  </table>
                  {invitedEventsEntriesDOM.length === 0 ? <span> No events that you're invited to...Feeling lonely?</span> : <span></span>}
              </div>
            </div>
          </div>
        </div>
    )
  }
}