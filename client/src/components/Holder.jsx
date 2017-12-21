import React from 'react'
import NavBar from './NavBar'

export default class Holder extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="holderParent">
        <div className="imageHolder">
        <div className="holderText">
          Thank you for voting, the results for you event will be displayed here
        </div>
        </div>
      </div>
    )
  }
}
