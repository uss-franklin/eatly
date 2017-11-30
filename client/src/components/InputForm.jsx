import React from 'react';
import moment from 'moment';
import InputMoment from 'input-moment';
import GuestEmailInput from './GuestEmailForm';

export default class InputForm extends React.Component {
  constructor() {
    super()
    this.state = {
      address: '',
      searchTerm: '',
      hostEmail: '',
      hostName: '',
      dateTime: moment(),
      guestEmails: [''] //requires intial value to render the first guest email form
    }
  }
  handleInputChange({ target }){
    this.setState({[target.name]: target.value},
       () => console.log(this.state));  
  }
  handleInputMoment(dateTime) {
    this.setState({ dateTime }, () => console.log(this.state.dateTime.format('llll')))
  }
  handleInputMomentSave() {
    console.log('saved', this.state.dateTime.format('llll'));
  }
  handleGuestEmailChange(){

  }
  addGuestEmailInput(){
  //adds a new element to guest email state. The re-render will add a new guest email input field. 
    this.setState(prevState => ({guestEmails: [...prevState.guestEmails, '']}),
    () => console.log(this.state.guestEmails)
    )
  }
  render(){
    return (
      <div className="form-container">
        <div className="form-location">
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
        <div className="form-food-searh">
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
        <div className="form-email">
        <label>
          Email:
          <input 
            type="text"
            name="hostEmail"
            placeholder="lookingforfood@something.com"
            value={this.state.email}
            onChange={this.handleInputChange.bind(this)}
          />
        </label>
        </div>
        <div className="form-host-name">
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
        <div className="form-event-name">
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
        <div className="form-date-time">
          <InputMoment
            moment={this.state.dateTime}
            onChange={this.handleInputMoment.bind(this)}
            minStep={10}
            />
        </div>
        <div className="form-add-guests">
          {this.state.guestEmails
            .map((guest, idx) => 
              <GuestEmailInput idx={idx} key={idx} 
              handleChange={this.handleGuestEmailChange.bind(this)}/>)
          }
          <button className="add-guests" onClick={this.addGuestEmailInput.bind(this)}>
            Add Another
          </button>
        </div>



      </div>
    )
  }
}