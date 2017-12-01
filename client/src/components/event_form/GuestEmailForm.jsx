import React from 'react';

export default class GuestEmailForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: ''
    }
  }
  handleInputChange({ target }) {
    this.setState({value: target.value })
  }
  render() {
  const { handleGuestEmailPhoneChange, idx } = this.props;
  return (
    <div className="guest-email">
      <label>
        Guest Email:
        <input 
          type="text" 
          placeholder="Lookingforfoodtoo@something.com"
          value={this.state.value}
          onChange={this.handleInputChange.bind(this)}
          onBlur={e => handleGuestEmailPhoneChange('guestEmails', e.target.value, idx)}
        />
      </label>
    </div>
  )

  }
}


