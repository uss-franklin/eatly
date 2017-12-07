import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import queryString from 'query-string'

export default class GuestSwipe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0
    }
  }

  noVote() {
    let num = ++this.state.current;
    this.setState({current: num})
    let restaurantId = this.state.data.data.yelpSearchResultForEvent[this.state.current]
    let voteObj = {eventId: this.state.eventid, userId: this.state.blahblah, restaurantId: restaurantId, 
      vote: false}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('noVote res', response)
      })
  }
  yesVote() {
    let num = ++this.state.current;
    this.setState({current: num})
    let restaurantId = this.state.data.data.yelpSearchResultForEvent[this.state.current]
    let voteObj = {eventId: this.state.eventid, userId: this.state.blahblah, restaurantId: restaurantId, 
      vote: true}
    Axios.post('/vote', voteObj)
    .then((response) => {
      console.log('yesVote res', response)
    })
  }
  votingExpired(current, cutoff) {
    cutoff = new Date(cutoff)
    return (current.valueOf() > cutoff.valueOf())
  }
  lastClick(){
    if (this.state.current === Object.keys(this.state.data.data.yelpSearchResultForEvent).length) {
      console.log('lastclick is working')
      Axios.post('/voteAndGetConsensus', this.state.eventid)
        .then((response) => {
          console.log('lastClick res', response)
        })
    }
  }

  //example: http://localhost:3000/swipe?eventKey=-L-hkkpXZ58b7l6Kicgk&userId=1234 
  //parse returns {eventKey: "-L-hkkpXZ58b7l6Kicgk", userId: "1234"}

  componentDidMount() {
      if (location.search !== '') {
      let parsedqs = queryString.parse(location.search)
      console.log('parse', parsedqs)
      this.setState({userId: parsedqs.userId})
      Axios.get('/getRestaurants?eventKey=' + parsedqs.eventKey)
        .then((response) => {
          console.log('get req response', response)
          this.setState({eventKey: parsedqs.eventKey, data: response}, (cb) => {
            console.log('state', this.state)
          })
          // guest swipe page logic 
        })
        .catch((err) => console.log(err))
      }
  }

  
  render() {
    console.log('Swipe props: ', this.props)
    console.log('Swipe State: ', this.state)
    let loading = null
    if (this.state.data === undefined) {
      loading = <div>
        <div className="loadingtext"> restaurants being found... 
        </div>
          {/* <img className="trex" src="./images/trex.gif" /> */}
        </div>
    } else if (this.votingExpired(new Date(), this.state.data.data.voteCutOffDateTime) === true) {
      loading = 
      <div > 
      <div className="endtext">
        Thanks for voting, this page will display results for your event when everyone has voted
        </div>
        <img className="endphoto" src="./images/done.png" />
      </div> 
    } else if (this.state.current >= Object.keys(this.state.data.data.yelpSearchResultForEvent).length) {
      loading = 
      <div > 
      <div className="endtext">
        Thanks for voting, this page will display results for your event when everyone has voted
        </div>
        <img className="endphoto" src="./images/done.png" />
      </div> 
    }
    else {
      let restaurant = this.state.data.data.yelpSearchResultForEvent[this.state.current]
      let event = this.stae.data.data
      loading = <div className="swipeForm">
      <div className="eventtitle"> Event: <b>{event.eventName}</b> on {event.eventDateTime.slice(0,21)} </div>
      <div className="photoholder"> 
        <img className="photos" src={restaurant.image_url} />
      </div> 
      <div>
        <button className="noButton" onClick={() => {this.noVote(); this.lastClick()}}>
          <img src="./images/redx.png"/>
        </button>
        <button className="yesButton" onClick={() => {this.yesVote(); this.lastClick() }}>
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