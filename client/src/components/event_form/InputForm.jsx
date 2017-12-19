import React from 'react'
import moment from 'moment'
import InputMoment from 'input-moment'
import GuestForm from './GuestForm'
import Axios from 'axios'
import NavBar from '../NavBar'
import { Link } from 'react-router-dom'
import AutoCompleteFrame from './AutoCompleteFrame.jsx'
import MapWithAMarker from '../location_form/MapWithAMarker.jsx'
import authenticateUser from '../login/AuthenticateUserHelper'
import Loading from '../Loading'
import ReactStars from 'react-stars'
import DateTimePicker from 'react-datetime'

export default class InputForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      searchTerm: '',
      priceRange: 0,
      hostEmail: this.props.userAccountEmail || '',
      hostName: this.props.displayName || '',
      eventName: '',
      eventDescription: '',
      dateTime: moment().add(2, 'hour'),
      cutOffDateTime: moment().add(1, 'hour'),
      timeContraint: {}, //used to limit selectable hour in cuttofftime
      //Need to use a ternary here otherwise we get a ref error when inputForm is loaded without location state
      //Location state is sent through the Link route 'to' property
      guestEmails: this.props.routeProps.location.state !== undefined ? this.props.routeProps.location.state.usersToInvite.guestEmails : [''], //requires intial value to render the first guest email form
      guestPhones: [''],
      guestNames: this.props.routeProps.location.state !== undefined ? this.props.routeProps.location.state.usersToInvite.guestNames : [''],
      firebaseId: this.props.firebaseId, 
      longitude: null,
      latitude: null,
      submitClick: false,
      radius: null
    }
  }
  updateLatLng(lat, lng){
    this.setState({latitude: lat, longitude: lng});
  }
  updateAddress(address){
    this.setState({address: address});
  }
  handleInputChange({ target }){
    this.setState({[target.name]: target.value});  
  }
  handleValidCutOffDate(current) {
    let yesterday = moment().subtract(1, 'day')
    let maxDate = this.state.dateTime
    return current.isAfter(yesterday) && current.isBefore(maxDate)
  }
  handleValidDate(current) {
    //prevent selecting a day in the past
    let yesterday = moment().subtract(1, 'day')
    return current.isAfter(yesterday)
  }
  handleCutOffDateChange(dateTime){
    if (typeof dateTime !== 'string') {
      this.setState({cutOffDateTime: dateTime}, () => console.log(this.state.cutOffDateTime))
    }
  }
  handleEventDateChange(dateTime){
    if (typeof dateTime !== 'string') {
      let cutOffDateTime = moment(dateTime).subtract(1, 'hour')
      this.setState({dateTime: dateTime, cutOffDateTime: cutOffDateTime}, () => console.log(this.state.dateTime))
      //update the time constraint to on the date picker component
      
    }
  }
  updatePriceRange(newPrice) {
    this.setState({priceRange: newPrice})
  }
  addGuest(list, value, idx){
    //list determines whether we need to update the guestemail list or phone guest list
    this.setState(prevState => {
      let updatedGuestList = prevState[list].slice();
      updatedGuestList[idx] = value
      return {[list]: updatedGuestList}
    })
  }
  addGuestEmailInputField(){
  //adds a new element to guest email state. The re-render will add a new guest email input field. 
    this.setState(prevState => ({guestEmails: [...prevState.guestEmails, '']}))
  }
  removeGuest(idx) {
    this.setState(prevState => {
      let guestEmails = prevState.guestEmails.slice()
      guestEmails.splice(idx, 1)
      let guestPhones = prevState.guestPhones.slice()
      guestPhones.splice(idx, 1)
      let guestNames = prevState.guestNames.slice()
      guestNames.splice(idx, 1)
      return {guestEmails: guestEmails, guestPhones: guestPhones, guestNames: guestNames}
    },)
  }
  submitForm(){
    this.setState({submitClick: true})
    let sendObj = Object.assign({}, this.state);
    console.log('sendobj', sendObj)
    sendObj.dateTime = sendObj.dateTime.format('llll');
    sendObj.cutOffDateTime = sendObj.cutOffDateTime.format('llll');
    Axios.post('/createEvent', sendObj)
      .then((response) => {
        let eventId = response.data.eventId
        let userId = response.data.hostId
        window.location = `/swipe?eventKey=${eventId}&userId=${userId}`
      })
      .catch(err => console.log('Form Submission Error: ', err));
    //activates the twilio function to send SMS out to all guests user inputs into form
    Axios.post('/messages')
      .catch(err => console.log('SMS sending error: ' + err))
  }
  render(){
    let mapView = <div></div>;
    if(this.state.latitude && this.state.longitude) {
        mapView = <div>
            <MapWithAMarker
                lat={this.state.latitude}
                lng={this.state.longitude}
                defaultZoom={16}
                containerElement={<div style={{height: `400px`}}/>}
                mapElement={<div style={{height: `100%`}}/>}
            />
        </div>
    }
    let emailNameInputs = <div>
                            <div className="form-email" className="inputs">
                            <label>
                              Your Email:
                              <input
                                readOnly={this.props.userAccountEmail ? true : false}
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
                                readOnly={this.props.displayName? true : false}
                                type="text"
                                name="hostName"
                                placeholder="Your Name"
                                value={this.state.hostName}
                                onChange={this.handleInputChange.bind(this)}
                              />
                            </label>
                            </div>
                          </div>
    if (!!this.props.userAccountEmail) emailNameInputs = null
    return (
      this.state.submitClick ? <Loading /> :
      <div className="wholeForm">
      <div className="form-create-event">
        <div className="form-location" className="inputs">
        <label>
          Restaurants Around:
          <AutoCompleteFrame updateLatLng={this.updateLatLng.bind(this)} updateAddress={this.updateAddress.bind(this)} />
        </label>
        </div>
        <div className="form-proximity-dropdown" className="inputs">
          <label>
            Within how many miles:
            <select name="radius" value={this.state.radius} onChange={this.handleInputChange.bind(this)} >
                <option value="default">Please Select </option>
                <option value= "0.5">0.5 miles</option>
                <option value = "1">1 mile</option>
                <option value = "3">3 miles</option>
                <option value = "5">5 miles</option>
                <option value = "10">10 miles</option>
            </select>
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
        <div className="price-range"> 
          Price Range:<ReactStars char={'$'} half={false} value={this.state.priceRange} onChange={this.updatePriceRange.bind(this)}/>
        </div>
        {emailNameInputs}
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
        <div className="inputs">
          <label>
            Event Description:
            <input
              type="text"
              size="30"
              name="eventDescription"
              placeholder="Add a description for your guests"
              value={this.state.eventDescription}
              onChange={this.handleInputChange.bind(this)}
            />
          </label>
        </div>
        <div className="form-date-time" className="inputs">
          <label>
            Event Time:
            <DateTimePicker
              value={this.state.dateTime} 
              isValidDate={this.handleValidDate} 
              onChange={this.handleEventDateChange.bind(this)}
              />
          </label>
        </div>
        <div className="form-date-time-cutoff" className="inputs">
          <label>
            Cutoff Time:
            <DateTimePicker 
              isValidDate={this.handleValidCutOffDate.bind(this)} 
              value={this.state.cutOffDateTime} 
              closeOnSelect={true}
              onChange={this.handleCutOffDateChange.bind(this)}
              timeConstraints={this.state.timeContraint}
              />
          </label>
        </div>
        <div className="form-add-guests" className="inputs">
          {this.state.guestEmails
            .map((guestEmail, idx) => {
               return (
                  <GuestForm
                  email={guestEmail}
                  name={this.state.guestNames[idx]}
                  idx={idx} 
                  key={idx} 
                  addGuest={this.addGuest.bind(this)}
                  removeGuest={this.removeGuest.bind(this)}
                  />
              )
            })
          }
          <button className="add-guests" onClick={this.addGuestEmailInputField.bind(this)}>
            Add Another
          </button>
        </div>
        <div>
          {mapView}
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