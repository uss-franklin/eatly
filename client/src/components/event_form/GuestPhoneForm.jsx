import React from 'react';

export default class GuestPhoneForm extends React.Component {
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
          placeholder="212-555-5656"
          value={this.state.value}
          onChange={this.handleInputChange.bind(this)}
          onBlur={e => handleGuestEmailPhoneChange('guestPhones', e.target.value, idx)}
        />
      </label>
    </div>
  )

  }
}


