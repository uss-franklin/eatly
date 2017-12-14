import React from 'react'

export default class Loading extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <h3 className="loadingtext">Our minions are gathering restaurants... </h3>
        <img className="trex" src='./images/pasta.gif' />
      </div>
    )
  }
}