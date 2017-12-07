import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import queryString from 'query-string'

export default class Swipe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0
    }
    this.guestUser = this.guestUser.bind(this);
  }

  lastClick(){
      console.log('lastclick is working')
      console.log('last click eventid', this.props.eventid )
      Axios.post('/voteAndGetConsensus', {eventId: this.props.eventid})
        .then((response) => {
          console.log('lastClick res', response)
        })
        .catch((err) => {console.log('lastClick error', err)})
  }

  noVote() {
    if (this.state.current + 1  === Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length) {
      this.lastClick()
    }
    let restaurantId = this.state.current
    let voteObj = {eventId: this.props.eventid, userId: this.props.eventData.data.eventHost, restaurantId: restaurantId, 
      vote: false}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('noVote res', response)
        let num = ++this.state.current
        this.setState({current: num})
      })
      .catch((err) => { console.log(err)})
  }
  yesVote() {
    if (this.state.current + 1  === Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length) {
      this.lastClick()
    }
    else {
      let restaurantId = this.state.current
      let voteObj = {eventId: this.props.eventid, userId: this.props.eventData.data.eventHost, restaurantId: restaurantId, 
        vote: true}
      Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('yesVote res', response)
        let num = ++this.state.current;
        this.setState({current: num})
      })
      .catch((err) => { console.log(err)})
    }
  }
  votingExpired(current, cutoff) {
    cutoff = new Date(cutoff)
    return (current.valueOf() > cutoff.valueOf())
  }

  guestNoVote() {
    if (this.state.current + 1 === Object.keys(this.state.data.data.yelpSearchResultForEvent).length) {
      this.guestLastClick();
    }
    let restaurantId = this.state.current
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: restaurantId, vote: false}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('guestNoVote response: ', response)
        let num = ++ this.state.current
        this.setState({current: num})
      })
      .catch((err) => { console.log('guestNoVote error:', err)})
  }

  guestYesVote() {
    if (this.state.current + 1 === Object.keys(this.state.data.data.yelpSearchResultForEvent).length) {
      this.guestLastClick();
    }
    let restaurantId = this.state.current
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: restaurantId, vote: true}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('guestYesVote response: ', response)
        let num = ++ this.state.current
        this.setState({current: num})
      })
      .catch((err) => { console.log('guestYesVote error:', err)})
  }

  guestLastClick() {
    console.log('guest last click working')
    Axios.post('/voteAndGetConsensus', {eventId: this.state.eventKey})
    .then((response) => {
      console.log('GuestlastClick res', response)
    })
    .catch((err) => {console.log('lastClick error', err)})
  }

  //duplicate voting functions for guest users noVote, yesVote, lastClick



  //example: http://localhost:3000/swipe?eventKey=-L-hkkpXZ58b7l6Kicgk&userId=1234 
  //parse returns {eventKey: "-L-hkkpXZ58b7l6Kicgk", userId: "1234"}

  componentDidMount() {
    if (location.search !== '') {
      this.guestUser();
    }
  }

  guestUser() {
    let parsedqs = queryString.parse(location.search)
    console.log('parse', parsedqs)
    this.setState({userId: parsedqs.userId})
    Axios.get('/getRestaurants?eventKey=' + parsedqs.eventKey)
      .then((response) => {
        console.log('get req response', response)
        this.setState({eventKey: parsedqs.eventKey, data: response}, (cb) => {
        console.log('state', this.state)
        })
      })
      .catch((err) => console.log(err))
  }

  
  render() {
    let loading = null
    //guest code 
    if (location.search !== '') {
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
        let event = this.state.data.data
        loading = <div className="swipeForm">
        <div className="eventtitle"> Event: <b>{event.eventName}</b> on {event.eventDateTime.slice(0,21)} </div>
        <div className="photoholder"> 
          <img className="photos" src={restaurant.image_url} />
        </div> 
        <div>
          <button className="noButton" onClick={() => {this.guestNoVote() }}>
            <img src="./images/redx.png"/>
          </button>
          <button className="yesButton" onClick={() => {this.guestYesVote() }}>
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

    } 
    
    //host code 
    else {
    console.log('Swipe props: ', this.props)
    console.log('Swipe State: ', this.state)
    let loading = null
    if (this.props.eventData === undefined) {
      loading = <div>
        <div className="loadingtext"> restaurants being found... 
        </div>
          {/* <img className="trex" src="./images/trex.gif" /> */}
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
        <button className="noButton" onClick={() => {this.noVote() }}>
          <img src="./images/redx.png"/>
        </button>
        <button className="yesButton" onClick={() => {this.yesVote() }}>
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
  }
    
    return (
      <div> 
        {loading}
      </div>
    )
  }
}