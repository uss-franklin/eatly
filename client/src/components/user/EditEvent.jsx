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
      eventDateTime: '',
      eventHost: '',
      voteCutOffDateTime: moment(),
      guestEmails: [''], //requires intial value to render the first guest email form
      guestPhones: [''],
    }
  }
  getEventDetail(eid) {
    return Axios.get(`/getSingleEvent?eid=${eid}`).then(resp => resp.data)
  }
  processData(event) {
    let cutOffDateArr = event.voteCutOffDateTime.split(' ')
    let cutOfftimeArr = cutOffDateArr[4].split(':')
    event.voteCutOffDateTime = moment()
    .month(cutOffDateArr[1])
    .date(cutOffDateArr[2])
    .hour(cutOfftimeArr[0])
    .minute(cutOfftimeArr[1])
    .second(cutOfftimeArr[2])
    this.setState(event, () => console.log('state', this.state))
  }
  componentDidMount(){
    let parsedEid = queryString.parse(location.search).eventKey
    console.log('event id: ', parsedEid)
    this.getEventDetail(parsedEid)
    .then(eventDetails => this.processData(eventDetails))
  }
  handleInputChange({ target }){
    this.setState({[target.name]: target.value});  
  }
  
  handleInputMoment(dateTime) {
    this.setState({voteCutOffDateTime: dateTime }, () => console.log(stateProp, this.state[stateProp].format('llll')))
  }
  
  addGuestEmailPhone(list, value, idx){
    //list determines whether we need to update the guestemail list or phone guest list
    this.setState(prevState => {
      let updatedGuestList = prevState[list].slice();
      console.log('getting state list: ', list, updatedGuestList)
      updatedGuestList[idx] = value
      return {[list]: updatedGuestList}
    }, () => console.log('updated state', this.state[list]))
  }
  
  addGuestEmailInputField(){
  //adds a new element to guest email state. The re-render will add a new guest email input field. 
    this.setState(prevState => ({guestEmails: [...prevState.guestEmails, '']}))
  }
  deleteEvent(){
    let eventHostId = Object.keys(this.state.eventHost)[0]
    let inviteesIds = Object.keys(this.state.eventInvitees)
    let payload = {params: {eid: this.state.eid, uid: eventHostId, inviteeuids: inviteesIds}}
    console.log(payload)
    Axios.delete('/deleteEvent', payload)
    .then(() => console.log('deleted: ', this.state.eid))

  }
  submitForm(){
    let sendObj = Object.assign({}, this.state);
    let dummyNumber = this.state.dummyPhoneNumber;
    sendObj.dateTime = sendObj.dateTime.format('llll');
    sendObj.cutOffDateTime = sendObj.cutOffDateTime.format('llll');
    Axios.post('/editEvent', sendObj)
      .then((response) => {
        console.log('edit event form response data: ', response)
      })
      .catch(err => console.log('Edit Event Form Submission Error: ', err));  
  }
  
  render(){
    return (
      <div className="editEventForm parent">
      <div className="form-edit-event">

        <div className="form-event-name inputs">

	        <h1 className="editEventFormCurrentTitle">
	        	Edit [Current Event Name]
	        </h1>
	        <h2 className="editEventFormCurrentDateTime">
	        	[Current Event Date] - [Current Event Time]
	        </h2>

	        <label>
	          New Name:
	          <input 
	            type="text"
	            name="eventName"
	            placeholder="Name your outing!"
	            value={this.state.eventName}
	            onChange={this.handleInputChange.bind(this)}
	          />
	        </label>
        
        </div>
        
        <div className="form-date-time-cutoff" className="inputs">
          <label>
            New Cutoff Time:
          <InputMoment
            moment={this.state.voteCutOffDateTime}
            onChange={m => this.handleInputMoment.call(this, m, true)}
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
        	<button className="editFormSaveChangesButton">Save Changes</button>
        </div>

        <div className="editFormDeleteEvent">
        	<button className="editFormDeleteEventButton" onClick={this.deleteEvent.bind(this)}>Delete Event</button>
        </div>
        
      	</div>
     </div>
    )
  }
}