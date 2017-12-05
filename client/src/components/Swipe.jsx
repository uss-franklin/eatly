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

  render() {
    console.log('Swipe props: ', this.props)
    console.log('Swipe State: ', this.state)
    //if else goes here for loading and data 
    let loading = null
    if (this.props.eventData === undefined) {
      loading = <div> restaurants being found... 
        <img src="./images/trex.gif" />
      </div>
    } else if (this.state.current > 11) {
      loading = <div> Thanks for voting, this page will display results for your event when everyone has voted
                  <img src="./images/done.png" />
                </div> 
    }
    else {
      let restaurant = this.props.eventData.data.yelpSearchResultForEvent[this.state.current]
      let event = this.props.eventData.data
      loading = <div className="swipeForm">
      <div> {event.eventName} {event.eventDateTime} </div>
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
      <div> Voting ends at: {event.voteCutOffDateTime}</div>
      </div>
    }
    
    return (
      <div> 
        {loading}
      </div>
    )
  }
}