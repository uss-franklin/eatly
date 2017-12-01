import React from 'react';
import moment from 'moment';
import InputMoment from 'input-moment';
import GuestEmailInput from './GuestEmailForm';
import Axios from 'axios';
import NavBar from './NavBar'

export default class InputForm extends React.Component {
  constructor() {
    super()
    this.state = {
      address: '',
      searchTerm: '',
      hostEmail: '',
      hostName: '',
      eventName: '',
      dateTime: moment(),
      guestEmails: [''] //requires intial value to render the first guest email form
    }
  }
  handleInputChange({ target }){
    this.setState({[target.name]: target.value});  
  }
  handleInputMoment(dateTime) {
  //InputMoment returns a moment object which should not be accessed directly. To extract //the values, use the format method method. 
  //see https://momentjs.com/docs/#/displaying/format/
    this.setState({ dateTime }, () => console.log(this.state.dateTime.format('llll')))
  }
  addGuestEmail(value, idx){
    this.setState(prevState => {
      let updatedGuestList = prevState.guestEmails.slice();
      updatedGuestList[idx] = value
      return {guestEmails: updatedGuestList}
    }, () => console.log(this.state.guestEmails))
  }
  addGuestEmailInputField(){
  //adds a new element to guest email state. The re-render will add a new guest email input field. 
    this.setState(prevState => ({guestEmails: [...prevState.guestEmails, '']}))
  }
  submitForm(){
    let sendObj = Object.assign({}, this.state);
    sendObj.dateTime = sendObj.dateTime.format('llll');
    Axios.post('/createEvent', sendObj)
      .catch(err => console.log('Form Submission Error: ', err));
  }
  render(){
    return (
      <div className="parent">
      <NavBar />
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
          <InputMoment
            moment={this.state.dateTime}
            onChange={this.handleInputMoment.bind(this)}
            minStep={10}
            />
        </div>
        <div className="form-add-guests" className="inputs">
          {this.state.guestEmails
            .map((guest, idx) => 
              <GuestEmailInput idx={idx} key={idx} 
              handleGuestEmailChange={this.addGuestEmail.bind(this)}/>)
          }
          <button className="add-guests" onClick={this.addGuestEmailInputField.bind(this)}>
            Add Another
          </button>
        </div>
        <div className="form-create-event" className="inputs">
          <button onClick={this.submitForm.bind(this)}>Find Restaurants</button>
        </div>
      </div>
      </div>
      </div>
    )
  }
}