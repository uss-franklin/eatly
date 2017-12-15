import React from 'react';

export default class GuestEmailForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      name: ''
    }
  }
  handleInputChange({ target }) {
    this.setState({[target.name]: target.value })
  }
  render() {
  const { addGuest, removeGuest, idx } = this.props;
  return (
    <div className="guestForm">
      <label>
        Guest Email:
        <input 
          type="text"
          name="email"
          placeholder="Lookingforfoodtoo@something.com"
          value={this.state.email}
          onChange={this.handleInputChange.bind(this)}
          onBlur={e => addGuest('guestEmails', e.target.value, idx)}
        />
      </label>
      <label>
        Guest Name:
        <input 
          type="text" 
          name="name"
          placeholder="Guest Name"
          value={this.state.name}
          onChange={this.handleInputChange.bind(this)}
          onBlur={e => addGuest('guestNames', e.target.value, idx)}
        />
      </label>
      <label>
        Guest Phone Number:
        <input
          type="text"
          name="phone"
          placeholder="(optional) +12123994045"
          value={this.state.value}
          onChange={this.handleInputChange.bind(this)}
          onBlur={e => addGuest('guestPhones', e.target.value, idx)}
        />
      </label>
      {idx === 0 ? null : <button onClick={() => removeGuest(idx)} >X</button> }
    </div>

  )
  }
}


