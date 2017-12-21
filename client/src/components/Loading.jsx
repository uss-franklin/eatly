import React from 'react'

export default class Loading extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="loadingPage">
          <h3 className="loadingtext">Our minions are gathering your restaurants... </h3>
          <img className="pastagif" src='./images/pastas.gif' />
      </div>
    )
  }
}