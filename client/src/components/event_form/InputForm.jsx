import React from 'react'
import moment from 'moment'
import InputMoment from 'input-moment'
import GuestEmailInput from './GuestEmailForm'
import GuestPhoneInput from './GuestPhoneForm'
import Axios from 'axios'
import NavBar from '../NavBar'
import { Link } from 'react-router-dom'

export default class InputForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      searchTerm: '',
      hostEmail: this.props.userAccountEmail || '',
      hostName: '',
      eventName: '',
      dateTime: moment(),
      cutOffDateTime: moment().add(1, 'hour'),
      guestEmails: [''], //requires intial value to render the first guest email form
      guestPhones: [''], //same as above comment
      guestNames: [''],
      firebaseId: this.props.firebaseId // needed to check whether we need to create the user
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
    sendObj.dateTime = sendObj.dateTime.format('llll');
    sendObj.cutOffDateTime = sendObj.cutOffDateTime.format('llll');
    Axios.post('/createEvent', sendObj)
      .then((response) => {
        console.log('submit form response data: ', response)
        let eventId = response.data.eventId
        let userId = response.data.hostId
        window.location = `/swipe?eventKey=${eventId}&userId=${userId}`
      })
      .catch(err => console.log('Form Submission Error: ', err));
    //activates the twilio function to send SMS out to all guests user inputs into form
    Axios.post('/messages', dummyNumber)
      .catch(err => console.log('SMS sending error: ' + err))
  }
  render(){
    return (
      <div className="wholeForm">
      <div className="form-create-event">
        <div className="form-location" className="inputs">
        <label>
          Restaurants Around:
          <input 
            type="text" 
            name="address"
            placeholder="Enter an Address" 
            value={this.state.address} 
            onChange={this.handleInputChange.bind(this)}
          />
          </label>
        </div>
        <div className="form-food-search" className="inputs">
        <label>
          Type of Cuisine:
          <input 
            type="text"
            name="searchTerm"
            placeholder="What are you in the mood for?"
            value={this.state.searchTerm}
            onChange={this.handleInputChange.bind(this)}
          />
        </label>
        </div>
        <div className="form-email" className="inputs">
        <label>
          Your Email:
          <input 
            type="text"
            name="hostEmail"
            placeholder="Lookingforfood@something.com"
            value={this.state.hostEmail}
            onChange={this.handleInputChange.bind(this)}
          />
        </label>
        </div>
        <div className="form-host-name" className="inputs">
        <label>
          Your Name:
          <input 
            type="text"
            name="hostName"
            placeholder="Your Name"
            value={this.state.hostName}
            onChange={this.handleInputChange.bind(this)}
          />
        </label>
        </div>
        <div className="form-event-name" className="inputs">
        <label>
          Event Name:
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
            Event Date:
            <InputMoment
              moment={this.state.dateTime}
              onChange={m => this.handleInputMoment.call(this, m, false)}
              minStep={10}
              />
          </label>
        </div>
        <div className="form-date-time-cutoff" className="inputs">
          <label>
            Cutoff Time:
          <InputMoment
            moment={this.state.cutOffDateTime}
            onChange={m => this.handleInputMoment.call(this, m, true)}
            minStep={10}
            />
          </label>
        </div>
        <div className="form-add-guests" className="inputs">
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
          <button className="add-guests" onClick={this.addGuestEmailInputField.bind(this)}>
            Add Another
          </button>
        </div>
        <div className="form-create-event" className="inputs">
          <button onClick={this.submitForm.bind(this)}>
            Find Restaurants
          </button>
        </div>
      </div>
      </div>
    )
  }
}