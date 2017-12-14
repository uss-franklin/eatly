import React from 'react'
import moment from 'moment'
import InputMoment from 'input-moment'
import GuestEmailInput from './GuestEmailForm'
import GuestPhoneInput from './GuestPhoneForm'
import Axios from 'axios'
import NavBar from '../NavBar'
import { Link } from 'react-router-dom'
import AutoCompleteFrame from './AutoCompleteFrame.jsx'
import MapWithAMarker from '../location_form/MapWithAMarker.jsx'
import authenticateUser from '../login/AuthenticateUserHelper'
import Loading from '../Loading'

export default class InputForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      searchTerm: '',
      hostEmail: this.props.userAccountEmail || '',
      hostName: this.props.displayName || '',
      eventName: '',
      dateTime: moment().add(2, 'hour'),
      cutOffDateTime: moment().add(1, 'hour'),
      guestEmails: [''], //requires intial value to render the first guest email form
      guestPhones: [''], //same as above comment
      guestNames: [''],
      firebaseId: this.props.firebaseId, // needed to check whether we need to create the user
      longitude: null,
      latitude: null,
      submitClick: false
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
  handleInputMoment(dateTime, isCutOff) {
  //InputMoment returns a moment object which should not be accessed directly. To extract the values, use the format method. 
  //see https://momentjs.com/docs/#/displaying/format/
    if(dateTime.unix() < moment().unix()) {
      alert('You can\'t live in the past')
    } else {
      if (!isCutOff) {
      console.log(isCutOff)
      let newCutOffTime = moment(dateTime).subtract(1, 'hour')
      this.setState({'dateTime': dateTime, 'cutOffDateTime': newCutOffTime}) 
      } else {
      if (dateTime.unix() > moment(this.state.dateTime).subtract(1, 'hour').unix()) {
        alert('Please select a cut off time that\'s at least an hour before the event time')
      }
      this.setState({'cutOffDateTime': dateTime })
      }
    }
  }
  addGuestEmailPhone(list, value, idx){
    //list determines whether we need to update the guestemail list or phone guest list
    this.setState(prevState => {
      let updatedGuestList = prevState[list].slice();
      // console.log('getting state list: ', list, updatedGuestList)
      updatedGuestList[idx] = value
      return {[list]: updatedGuestList}
    }, () => console.log('updated state'))
  }
  addGuestEmailInputField(){
  //adds a new element to guest email state. The re-render will add a new guest email input field. 
    this.setState(prevState => ({guestEmails: [...prevState.guestEmails, '']}))
  }
  submitForm(){
    this.setState({submitClick: true})
    let sendObj = Object.assign({}, this.state);
    sendObj.dateTime = sendObj.dateTime.format('llll');
    sendObj.cutOffDateTime = sendObj.cutOffDateTime.format('llll');
    Axios.post('/createEvent', sendObj)
      .then((response) => {
        console.log('submit form response data')
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
          <AutoCompleteFrame updateLatLng={this.updateLatLng.bind(this)} updateAddress={this.updateAddress.bind(this)}/>
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
        <div className="form-date-time" className="inputs">
          <label>
            Event Date:
            <InputMoment
              moment={this.state.dateTime}
              onChange={m => this.handleInputMoment.call(this, m, false)}
              minStep={30}
              />
          </label>
        </div>
        <div className="form-date-time-cutoff" className="inputs">
          <label>
            Cutoff Time:
          <InputMoment
            moment={this.state.cutOffDateTime}
            onChange={m => this.handleInputMoment.call(this, m, true)}
            minStep={30}
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