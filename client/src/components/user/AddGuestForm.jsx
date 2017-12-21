import React from 'react'

export default class AddGuestForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      name: '',
    }
  }
  handleInputChange({ target }) {
    this.setState({[target.name]: target.value })
  }
  render() {
    return (
      <div className="guest-email">
        <label className="label"> Guest Email:</label>
          <input 
            className="input"
            type="text"
            name="email"
            placeholder="Lookingforfoodtoo@something.com"
            value={this.state.email}
            onChange={this.handleInputChange.bind(this)}
          />
        
        <label className="label">Guest Name:</label>
          <input 
            className="input"
            type="text" 
            name="name"
            placeholder="Guest Name"
            value={this.state.name}
            onChange={this.handleInputChange.bind(this)}
            onBlur={e => this.props.addNewGuestToState(this.state.email, this.state.name, this.props.idx)}
          />
        
      </div>
    ) 
    
  }
}