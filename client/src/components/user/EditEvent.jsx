import React from 'react'
import moment from 'moment'
import InputMoment from 'input-moment'
// import GuestEmailInput from './event_form/GuestEmailForm'
// import GuestPhoneInput from './event_form/GuestPhoneForm'
import Axios from 'axios'
import { Link } from 'react-router-dom'
import queryString from  'query-string'

export default class InputForm extends React.Component {
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
      eventInvitees: []
    }
  }
  //// START FETCH AND PROCESS DATA
  getEventUsers(eventInviteeUids) {
    let payload = {
      params: {eventInvitees: eventInviteeUids}
    }
    console.log('fetching user data for:', payload)
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
      this.setState(event, () => console.log('state', this.state))
    }) 
  }
  componentDidMount(){
    let parsedEid = queryString.parse(location.search).eventKey
    console.log('event id: ', parsedEid)
    this.getEventDetail(parsedEid)
    .then(eventDetails => this.processFetchedData(eventDetails))
  }

  ////START HTTP PUT AND PROCESS DATA
  updatePutObj(eventPropToUpdate, value) {
    this.setState(prevState => {
      let eventDataToUpdate = Object.assign({}, prevState.eventDataToUpdate)
      eventDataToUpdate[eventPropToUpdate] = value
      return {eventDataToUpdate: eventDataToUpdate}
    }, () => console.log(this.state))
  }
  handleTitleChange({ target }){
    this.setState({eventName: target.value})
    this.updatePutObj.call(this, 'eventName', target.value)  
  }
  handleInputMoment(dateTime) {
    this.setState({voteCutOffDateTime: dateTime })
    this.updatePutObj.call(this, 'voteCutOffDateTime', dateTime.format('llll'))
  }
  // addGuestEmailPhone(list, value, idx){
  //   //list determines whether we need to update the guestemail list or phone guest list
  //   this.setState(prevState => {
  //     let updatedGuestList = prevState[list].slice();
  //     console.log('getting state list: ', list, updatedGuestList)
  //     updatedGuestList[idx] = value
  //     return {[list]: updatedGuestList}
  //   }, () => console.log('updated state', this.state[list]))
  // }
  
  // addGuestEmailInputField(){
  // //adds a new element to guest email state. The re-render will add a new guest email input field. 
  //   this.setState(prevState => ({guestEmails: [...prevState.guestEmails, '']}))
  // }

  submitForm() {
    let payload = {eid: this.state.eid, fieldsToUpdate: this.state.eventDataToUpdate}
    Axios.put('/editEvent', payload)
      .then((resp) => console.log(resp.data))
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
    .then(() => console.log('deleted: ', this.state.eid))
  }

  render(){
    const dateTime = this.state.eventDateTime;
    return (
      <div className="editEventForm parent">
      <div className="form-edit-event">

        <div className="form-event-name inputs">

	        <h1 className="editEventFormCurrentTitle">
	        	Edit: {this.state.eventName}
	        </h1>
	        <h2 className="editEventFormCurrentDateTime">
	        	{dateTime.format('MMM [the] Do [of] YYYY')} at {dateTime.format('h:mm a')}
	        </h2>
          <p className="edit-page-message">If you would like to change the event time please create a <Link to="/inputForm" style={{ textDecoration: 'underline', color: 'blue'}}>new event</Link>.</p>
	        <label>
	          New Name:
	          <input 
	            type="text"
	            name="eventName"
	            placeholder="Name your outing!"
	            value={this.state.eventName}
	            onChange={this.handleTitleChange.bind(this)}
	          />
	        </label>
        </div>
        
        <div className="form-date-time-cutoff" className="inputs">
          <label>
            New Cutoff Time:
          <InputMoment
            moment={this.state.voteCutOffDateTime}
            onChange={m => this.handleInputMoment.call(this, m)}
            minStep={10}
            />
          </label>
        </div>

        <div className="editFormRemoveGuests">
        	<h3 className="editFormRemoveGuestsText">
        		Remove Guests:
        	</h3>

        	<button className="editFormRemoveGuestsButton">Remove Guests</button>
        </div>
          
        <div className="editFormSaveChanges">
        	<button className="editFormSaveChangesButton" onClick={this.submitForm.bind(this)}>Save Changes</button>
        </div>

        <div className="editFormDeleteEvent">
        	<button className="editFormDeleteEventButton" onClick={this.deleteEvent.bind(this)}>Delete Event</button>
        </div>
        
      	</div>
     </div>
    )
  }
}