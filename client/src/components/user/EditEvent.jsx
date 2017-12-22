import React from 'react'
import moment from 'moment'
import Axios from 'axios'
import { Link } from 'react-router-dom'
import queryString from  'query-string'
import EventGuest from './EventGuest'
import AddGuestForm from './AddGuestForm'
import DateTimePicker from 'react-datetime'

export default class EditEvent extends React.Component {
  constructor() {
    super()
    this.state = {
      eid: '',
      eventName: '',
      eventDateTime: moment(),
      eventHost: '',
      voteCutOffDateTime: moment(),
      eventDataToUpdate: {},
      inviteesDetails: [],
      eventInvitees: [],
      newGuestsEmails: [null],
      newGuestsNames: [null]
    }
  }

  //// START FETCH AND PROCESS DATA
  getEventUsers(eventInviteeUids) {
    let payload = {
      params: {eventInvitees: eventInviteeUids}
    }
    return Axios.get('/getGroupInvitedUsersDetails', payload).then(resp => resp.data)
  }
  getEventDetail(eid) {
    return Axios.get(`/getSingleEvent?eid=${eid}`).then(resp => resp.data)
  }
  makeMoment(dateTime) {
    let cutOffDateArr = dateTime.split(' ')
    let cutOfftimeArr = cutOffDateArr[4].split(':')
    return moment()
      .month(cutOffDateArr[1])
      .date(cutOffDateArr[2])
      .hour(cutOfftimeArr[0])
      .minute(cutOfftimeArr[1])
      .second(cutOfftimeArr[2])
  }
  processFetchedData(event) {
    event.voteCutOffDateTime = this.makeMoment(event.voteCutOffDateTime)
    event.eventDateTime = this.makeMoment(event.eventDateTime)
    this.getEventUsers(Object.keys(event.eventInvitees))
    .then(inviteesDetails => {
      event.inviteesDetails = inviteesDetails
      this.setState(event)
    }) 
  }
  componentDidMount(){
    let parsedEid = queryString.parse(location.search).eventKey
    this.getEventDetail(parsedEid)
    .then(eventDetails => this.processFetchedData(eventDetails))
  }

  ////START HTTP PUT AND PROCESS DATA
  updatePutObj(eventPropToUpdate, value) {
    this.setState(prevState => {
      let eventDataToUpdate = Object.assign({}, prevState.eventDataToUpdate)
      eventDataToUpdate[eventPropToUpdate] = value
      return {eventDataToUpdate: eventDataToUpdate}
    })
  }
  addAnotherGuestForm() {
    this.setState(prevState => ({newGuestsEmails: [...prevState.newGuestsEmails, null]}))
  }
  addNewGuestToState(email, name, idx) {
    this.setState(prevState => {
      let updatedGuestsEmails = prevState.newGuestsEmails.slice()
      let updatedGuestsNames = prevState.newGuestsNames.slice()
      updatedGuestsEmails[idx] = email
      updatedGuestsNames[idx] = name
      return {newGuestsEmails: updatedGuestsEmails, newGuestsNames: updatedGuestsNames}
    })
  }
  handleTitleChange({ target }){
    this.setState({eventName: target.value})
    this.updatePutObj.call(this, 'eventName', target.value)  
  }
  handleValidCutOffDate(current) {
    let yesterday = moment().subtract(1, 'day')
    let maxDate = this.state.eventDateTime
    return current.isAfter(yesterday) && current.isBefore(maxDate)
  } 
  handleCutOffDateChange(dateTime){
    if (typeof dateTime !== 'string') {
      this.setState({voteCutOffDateTime: dateTime})
      this.updatePutObj.call(this, 'voteCutOffDateTime', dateTime.format('llll'))
    }
  }
  submitForm() {
    let fieldsToUpdate = Object.assign({}, this.state.eventDataToUpdate)
    if (this.state.newGuestsEmails[0] !== null) {
      fieldsToUpdate.yelpResultsCount = this.state.eventHost[Object.keys(this.state.eventHost)[0]].votes.length
      //if the user left an empty field, we remove it from our payload
      if (this.state.newGuestsEmails[this.state.newGuestsEmails.length - 1] === null) {
        this.state.newGuestsEmails.pop()
      }
      fieldsToUpdate.newGuests = [this.state.newGuestsEmails, this.state.newGuestsNames]
    }
    let payload = {eid: this.state.eid, fieldsToUpdate: fieldsToUpdate}
    Axios.put('/editEvent', payload)
      .then((resp) => window.location.reload())
      .catch(err => console.log('Edit Event Form Submission Error: ', err));  
  }
  ////END HTTP PUT AND PROCESS DATA
  deleteEvent(){
    let payload = { params: {
      eid: this.state.eid,
      uid: Object.keys(this.state.eventHost)[0], 
      inviteeuids: Object.keys(this.state.eventInvitees),
      yelpresultsid: this.state.yelpSearchResultsKey
      }
    }
    Axios.delete('/deleteEvent', payload)
    .then(() => {this.props.history.push('/account')})
  }

  render(){
    const dateTime = this.state.eventDateTime;
    return (
      <div className="editEventForm">
        <div className="cardContainer is-centered">
          <div className="card">
            <header className="card-header">
              <p className="card-header-title is-centered">
                {this.state.eventName} on {dateTime.format('MMM [the] Do [of] YYYY')} at {dateTime.format('h:mm a')}
              </p>
            </header>
            <div className="card-content">
              <p className="edit-page-message">If you would like to change the event time please create a <Link to="/inputForm">new event</Link>.</p>
              <label className="label">New Name:</label>
                <input 
                  className="input"
                  type="text"
                  name="eventName"
                  placeholder="Name your outing!"
                  value={this.state.eventName}
                  onChange={this.handleTitleChange.bind(this)}
                />
               <label className="label">New Cutoff Time:</label>
                  <DateTimePicker 
                    inputProps={{className: 'input'}}
                    isValidDate={this.handleValidCutOffDate.bind(this)} 
                    value={this.state.voteCutOffDateTime} 
                    closeOnSelect={true}
                    onChange={this.handleCutOffDateChange.bind(this)}
                  />
                <div className="editFormGuests">
                <label className="label">Who's coming along:</label>
                  <table className="table"> 
                    <tbody>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                        {this.state.inviteesDetails.map((userDetails, idx) => <EventGuest details={userDetails} key={idx}/>)}
                    </tbody>
                  </table>
              </div>
              <div className="addGuests">
                <label className="label">Invite more friends:</label>
                {this.state.newGuestsEmails.map((guest, idx) => <AddGuestForm key={idx} idx={idx} addNewGuestToState={this.addNewGuestToState.bind(this)} /> )}
                <button className="button is-link is-small" onClick={this.addAnotherGuestForm.bind(this)} >Add Another </button>
              </div>
            </div>
            <footer className="class-card-footer">
              <a className="editFormSaveChangesButton card-footer-item" onClick={this.submitForm.bind(this)}>Save Changes</a>
              <a className="editFormDeleteEventButton card-footer-item" onClick={this.deleteEvent.bind(this)}>Delete Event</a>
            </footer>
          </div>
      	</div>
     </div>
    )
  }
}