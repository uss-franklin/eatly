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
          <b>You're all set! Sit back, relax and we'll reach out when all the votes are in</b>
        </div>
        </div>
        <div className="HolderButtonDiv">
          <button className="HolderEventButton" onClick={() => {window.location = '/inputForm'}}>Plan Another Event </button>
        </div>
      </div>
    )
  }
}
