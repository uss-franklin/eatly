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
  const { handleGuestEmailPhoneChange, idx } = this.props;
  return (
    <div className="guest-email">
      <label>
        Guest Email:
        <input 
          type="text"
          name="email"
          placeholder="Lookingforfoodtoo@something.com"
          value={this.state.email}
          onChange={this.handleInputChange.bind(this)}
          onBlur={e => handleGuestEmailPhoneChange('guestEmails', e.target.value, idx)}
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
          onBlur={e => handleGuestEmailPhoneChange('guestNames', e.target.value, idx)}
        />
      </label>
    </div>
  )

  }
}


