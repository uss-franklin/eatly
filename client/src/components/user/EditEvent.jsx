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
      dateTime: moment(),
      cutOffDateTime: moment(),
      guestEmails: [''], //requires intial value to render the first guest email form
      guestPhones: [''],
    }
  }
  getEventDetail(eid) {
    return Axios.get(`/getSingleEvent?eid=${eid}`).then(resp => resp.data)
  }
  componentDidMount(){
    let parsedEid = queryString.parse(location.search).eventKey
    console.log(parsedEid)
    this.getEventDetail(parsedEid)
    .then(eventDetails => {
      console.log(eventDetails)
      this.setState(eventDetails), () => console.log('state', this.state)
    })
  }
  handleInputChange({ target }){
    this.setState({[target.name]: target.value});  
  }
  
  handleInputMoment(dateTime, isCutOff) {
    //a boolean is passed to this function to tell set state if the dateTime object is for cutoff date or eventDate
    let stateProp = isCutOff ? 'cutOffDateTime' : 'dateTime'
  //InputMoment returns a moment object which should not be accessed directly. To extract //the values, use the format method method. 
  //see https://momentjs.com/docs/#/displaying/format/
    this.setState({[stateProp]: dateTime }, () => console.log(stateProp, this.state[stateProp].format('llll')))
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
  
  submitForm(){
    // console.log('submit form state:', this.state)
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

        <div className="form-date-time" className="inputs">
          <label>
            New Event Date:
            <InputMoment
              moment={this.state.dateTime}
              onChange={m => this.handleInputMoment.call(this, m, false)}
              minStep={10}
              />
          </label>
        </div>
        
        <div className="form-date-time-cutoff" className="inputs">
          <label>
            New Cutoff Time:
          <InputMoment
            moment={this.state.cutOffDateTime}
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
        	<button className="editFormDeleteEventButton">Delete Event</button>
        </div>
        
      	</div>
     </div>
    )
  }
}