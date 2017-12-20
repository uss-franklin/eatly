import React from 'react';

export default class GuestEmailForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: this.props.email || '',
      name: this.props.name || '',
      phone: ''
    }
  }
  handleInputChange({ target }) {
    this.setState({[target.name]: target.value })
  }
  render() {
    // console.log(this.state.name)
    const { addGuest, removeGuest, idx } = this.props;
    return (
      <div className="guest-form control">
        <label className="label">Guest Email:</label>
          <input
            className="input"
            type="text"
            name="email"
            placeholder="Lookingforfoodtoo@something.com"
            value={this.state.email}
            onChange={this.handleInputChange.bind(this)}
            onBlur={e => addGuest('guestEmails', e.target.value, idx)}
          />
      
        <label className="label">Guest Name:</label>
          <input
            className="input"
            type="text" 
            name="name"
            placeholder="Guest Name"
            value={this.state.name}
            onChange={this.handleInputChange.bind(this)}
            onBlur={e => addGuest('guestNames', e.target.value, idx)}
          />
        
        <label class="label"> Guest Phone Number:</label>
          <input
            className="input"
            type="text"
            name="phone"
            placeholder="(optional) +12123994045"
            value={this.state.phone}
            onChange={this.handleInputChange.bind(this)}
            onBlur={e => addGuest('guestPhones', e.target.value, idx)}
          />
        
        {idx === 0 ? null : <button className="button" onClick={() => removeGuest(idx)} >Remove Guest</button> }
      </div>

    )
  }
}


