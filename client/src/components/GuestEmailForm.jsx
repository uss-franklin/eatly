import React from 'react';

export default class GuestEmailForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: ''
    }
  }
  handleInputChange() {

  }
  render() {
  let {handleChange, idx} = this.props;
  return (
    <div className="guest-email">
      <label>
        Guest Email:
        <input 
          type="text" 
          placeholder="lookingforfoodtoo@something.com"
          value={this.state.value}
          onChange={undefined}
        />
      </label>
    </div>
  )

  }
}


