import React from 'react'
import moment from 'moment'
import InputMoment from 'input-moment'
import GuestEmailInput from './event_form/GuestEmailForm'
import GuestPhoneInput from './event_form/GuestPhoneForm'
import Axios from 'axios'
import NavBar from './NavBar'
import { Link } from 'react-router-dom'

export default class InputForm extends React.Component {
  constructor() {
    super()
    this.state = {
      eventName: '',
      dateTime: moment(),
      cutOffDateTime: moment(),
      guestEmails: [''], //requires intial value to render the first guest email form
      guestPhones: [''],
      dummyPhoneNumber: '+14254083980' //same as above comment
    }
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
    Axios.post('/createEvent', sendObj)
      .then((response) => {
        console.log('submit form response data: ', response)
        this.props.getEventId(response.data)
        this.props.getYelpData(response.data)
      })
      .catch(err => console.log('Form Submission Error: ', err));
    Axios.post('/messages', dummyNumber)
      .catch(err => console.log('SMS sending error: ' + err))
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
        <div className="form-add-guests" className="inputs">
          
          <h3 className="editFormAddRemoveGuestsText">
          	Add Guests: 
          </h3>

          {this.state.guestEmails
            .map((guest, idx) => {
              let emailKey = 'email' + idx
              let phoneKey = 'phone' + idx
               return (
                 <div>
                  <GuestEmailInput idx={idx} key={emailKey} 
                  handleGuestEmailPhoneChange={this.addGuestEmailPhone.bind(this)}/>
                  <GuestPhoneInput idx={idx} key={phoneKey}
                  handleGuestEmailPhoneChange={this.addGuestEmailPhone.bind(this)}/>
                </div>
              )
            })
          }

          <button className="editFormAddGuestsButton" onClick={this.addGuestEmailInputField.bind(this)}>
            Add Another
          </button>
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