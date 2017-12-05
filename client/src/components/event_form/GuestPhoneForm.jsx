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
    <div className="guest-phone">
      <label>
        Guest Phone Number:
        <input 
          type="text" 
          placeholder="(optional) +12123994045"
          value={this.state.value}
          onChange={this.handleInputChange.bind(this)}
          onBlur={e => handleGuestEmailPhoneChange('guestPhones', e.target.value, idx)}
        />
      </label>
    </div>
  )

  }
}


