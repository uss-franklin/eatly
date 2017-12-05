import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'

export default class Swipe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0
    }
  }

  goToNext() {
    let num = ++this.state.current;
    this.setState({current: num})
  }

  addRestaurant() {
    //add in vote saving logic here 
    let num = ++this.state.current;
    this.setState({current: num})
  }
  votingExpired(current, cutoff) {
    cutoff = new Date(cutoff)
    return (current.valueOf() > cutoff.valueOf())
  }

  render() {
    console.log('Swipe props: ', this.props)
    console.log('Swipe State: ', this.state)

    let loading = null
    if (this.props.eventData === undefined) {
      loading = <div>
        <div className="loadingtext"> restaurants being found... 
        </div>
          <img className="trex" src="./images/trex.gif" />
        </div>
      
    } else if (this.votingExpired(new Date(), this.props.eventData.data.voteCutOffDateTime) === true) {
      loading = 
      <div > 
      <div className="endtext">
        Thanks for voting, this page will display results for your event when everyone has voted
        </div>
        <img className="endphoto" src="./images/done.png" />
      </div> 
    } else if (this.state.current >= Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length) {
      loading = 
      <div > 
      <div className="endtext">
        Thanks for voting, this page will display results for your event when everyone has voted
        </div>
        <img className="endphoto" src="./images/done.png" />
      </div> 
    }
    else {
      let restaurant = this.props.eventData.data.yelpSearchResultForEvent[this.state.current]
      let event = this.props.eventData.data
      loading = <div className="swipeForm">
      <div className="eventtitle"> Event: <b>{event.eventName}</b> on {event.eventDateTime.slice(0,21)} </div>
      <div className="photoholder"> 
        <img className="photos" src={restaurant.image_url} />
      </div> 
      <div>
        <button className="noButton" onClick={() => this.goToNext()}>
          <img src="./images/redx.png"/>
        </button>
        <button className="yesButton" onClick={() => this.addRestaurant()}>
          <img src="./images/checkmark.png"/>
        </button>
      </div>
      <div className="descriptions"> {restaurant.name} </div>
      <div className="descriptions"> Price: {restaurant.price} </div>
      <div className="descriptions"> Rating: {restaurant.rating}/5 </div>
      <div className="descriptions"> Number of Reviews: {restaurant.review_count} </div>
      <div> Voting ends at: {event.voteCutOffDateTime.slice(0,21)}</div>
      </div>
    }
    
    return (
      <div> 
        {loading}
      </div>
    )
  }
}