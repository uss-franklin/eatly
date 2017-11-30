import React from 'react';

export default class InputForm extends React.Component {
  constructor() {
    super()
    this.state = {
      address: '',
      searchTerm: '',
      email: '',
      hostName: ''
    }
  }
  handleInputChange({ target }){
    this.setState({[target.name]: target.value},
       () => console.log(this.state))
    
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
            name="email"
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



      </div>
    )
  }
}