import React from 'react'
import NavBar from '../NavBar'

export default class Account extends React.Component {
  constructor(props){
    super(props)
  }
  render() {
    console.log("account page user", this.props.user)
    return (
    <div>
    WORKS!
    </div>
    )
  }
}