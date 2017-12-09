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

    this.noVote = this.noVote.bind(this)
    this.yesVote = this.yesVote.bind(this)
    this.lastClickTrue = this.lastClickTrue.bind(this)
    this.lastClickFalse = this.lastClickFalse.bind(this)
    this.votingExpired = this.votingExpired.bind(this)
    this.guestNoVote = this.guestNoVote.bind(this)
    this.guestYesVote = this.guestYesVote.bind(this)
    this.guestLastClickTrue = this.guestLastClickTrue.bind(this)
    this.guestLastClickFalse = this.guestLastClickFalse.bind(this)
    this.guestUser = this.guestUser.bind(this)
    
  }

  // host functions:
  //records a no vote on a restaurant 
  noVote() {
    let voteObj = {eventId: this.props.eventid, userId: this.props.eventData.data.eventHost, restaurantId: this.state.current, 
      vote: false}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('noVote res', response)
        let num = ++this.state.current
        this.setState({current: num}, () => {
          console.log('length', Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length)
          console.log(this.state.current)
          if (this.state.current  === Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length) {
              this.lastClickFalse()
            }
        })
      })
      .catch((err) => { console.log(err)})
  }
  yesVote() {
    let voteObj = {eventId: this.props.eventid, userId: this.props.eventData.data.eventHost, restaurantId: this.state.current, vote: true}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('yesVote res', response)
        let num = ++this.state.current;
        this.setState({current: num}, () => {
          if (this.state.current === Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length) {
            this.lastClickTrue()
          }
        })
      })
      .catch((err) => { console.log(err)})
  }
  //runs on the last restaurant vote, checks if everyone has voted, and if so, returns the winning restaurant
  lastClickTrue(){
    console.log('lastclick is working')
    console.log('last click eventid', this.props.eventid )
    Axios.post('/voteAndGetConsensus', {eventId: this.props.eventid, 
      userId: this.props.eventData.data.eventHost, 
      restaurantId:this.state.current, vote: true 
    })
      .then((response) => {
        console.log('lastClick res', response)
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  lastClickFalse(){
    console.log('lastclick is working')
    console.log('last click eventid', this.props.eventid )
    Axios.post('/voteAndGetConsensus', {eventId: this.props.eventid, 
      userId: this.props.eventData.data.eventHost, 
      restaurantId:this.state.current, vote: false 
    })
      .then((response) => {
        console.log('lastClick res', response)
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  //checks if the cutoff time for voting has passed
  votingExpired(current, cutoff) {
    cutoff = new Date(cutoff)
    return (current.valueOf() > cutoff.valueOf())
  }
  //guest functions
  //same structure and functionality as host functions above, just for invited guests
  guestNoVote() {
    let restaurantId = this.state.current
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: restaurantId, vote: false}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('guestNoVote response: ', response)
        let num = ++this.state.current
        this.setState({current: num}, () => {
          if (this.state.current === Object.keys(this.state.data.data.yelpSearchResultForEvent).length) {
            this.guestLastClickFalse();
          }
        })
      })
      .catch((err) => { console.log('guestNoVote error:', err)})
  }
  guestYesVote() {
    
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, vote: true}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('guestYesVote response: ', response)
        let num = ++this.state.current
        this.setState({current: num}, () => {
          if (this.state.current === Object.keys(this.state.data.data.yelpSearchResultForEvent).length) {
            this.guestLastClickTrue();
          }
        })
      })
      .catch((err) => { console.log('guestYesVote error:', err)})
  }
  guestLastClickTrue() {
    console.log('guest last click working')
    Axios.post('/voteAndGetConsensus', {eventId: this.state.eventKey, userId: this.state.userId, 
      restaurantId: this.state.current, vote: true})
      .then((response) => {
        console.log('GuestlastClick res', response)
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  guestLastClickFalse() {
    console.log('guest last click working')
    Axios.post('/voteAndGetConsensus', {eventId: this.state.eventKey, userId: this.state.userId, 
      restaurantId: this.state.current, vote: false})
      .then((response) => {
        console.log('GuestlastClick res', response)
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  //checks if it is a host or guest user
  componentDidMount() {
    if (location.search !== '') {
      this.guestUser();
    }
  }
  //gets the event data so guests can swipe through the restaurant choices 
  guestUser() {
    let parsedqs = queryString.parse(location.search)
    console.log('parse', parsedqs)
    this.setState({userId: parsedqs.userId})
    Axios.get('/getRestaurants?eventKey=' + parsedqs.eventKey + '&userId=' + parsedqs.userId)
      .then((response) => {
        console.log('get req response', response)
        this.setState({eventKey: parsedqs.eventKey, data: response}, (cb) => {
        console.log('state', this.state)
        })
      })
      .catch((err) => console.log(err))
  }

  render() {
    //view is used to display different views of the page: loading, swiping, and finished voting (from completion or cutoff time) 
    let view = null
    //views for guest users
    if (location.search !== '') {
      if (this.state.data === undefined) {
        view = 
          <div>
            <div className="loadingtext"> our minions are finding restaurants... </div>
            <img className="trex" src="./images/pasta.gif" />
          </div>
      } else if (this.votingExpired(new Date(), this.state.data.data.voteCutOffDateTime) === true) {
          view = 
            <div> 
              <div className="endtext"> Thanks for voting, this page will display results for your event when everyone has voted </div>
              <img className="endphoto" src="./images/done.png" />
            </div> 
      } else if (this.state.current >= Object.keys(this.state.data.data.yelpSearchResultForEvent).length) {
          view = 
            <div> 
              <div className="endtext"> Thanks for voting, this page will display results for your event when everyone has voted </div>
              <img className="endphoto" src="./images/done.png" />
            </div> 
      }
      else {
        let restaurant = this.state.data.data.yelpSearchResultForEvent[this.state.current]
        let event = this.state.data.data
        view = 
          <div className="swipeForm">
            <div className="eventtitle"> Event: <b>{event.eventName}</b> on {event.eventDateTime.slice(0,21)} </div>
            <div className="photoholder"> 
              <img className="photos" src={restaurant.image_url} />
              <div className="votecounter"> 
                Restaurant: {this.state.current + 1} of {Object.keys(this.state.data.data.yelpSearchResultForEvent).length}
              </div>
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
            <div className="descriptions"> Votes Left: {this.state.current}/{Object.keys(this.state.data.data.yelpSearchResultForEvent).length} </div>
            <div> Voting ends at: {event.voteCutOffDateTime.slice(0,21)}</div>
          </div>
      }
    } 
    
    //views for host users 
    else {
      console.log('Swipe props: ', this.props)
      console.log('Swipe State: ', this.state)
      if (this.props.eventData === undefined) {
        view = 
          <div>
            <div className="loadingtext"> our minions are finding restaurants... </div>
            <img className="trex" src="./images/pasta.gif" />
          </div>
      }  else if (this.votingExpired(new Date(), this.props.eventData.data.voteCutOffDateTime) === true) {
          view = 
            <div> 
              <div className="endtext">
                Thanks for voting, this page will display results for your event when everyone has voted
              </div>
              <img className="endphoto" src="./images/done.png" />
            </div> 
      } else if (this.state.current >= Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length) {
          view = 
            <div> 
              <div className="endtext">
                Thanks for voting, this page will display results for your event when everyone has voted
              </div>
              <img className="endphoto" src="./images/done.png" />
            </div> 
      }
      else {
        let restaurant = this.props.eventData.data.yelpSearchResultForEvent[this.state.current]
        let event = this.props.eventData.data
        view = 
          <div className="swipeForm">
            <div className="eventtitle"> Event: <b>{event.eventName}</b> on {event.eventDateTime.slice(0,21)} </div>
            <div className="photoholder"> 
              <img className="photos" src={restaurant.image_url} />
              <div className="votecounter"> 
                Restaurant: {this.state.current + 1} of {Object.keys(this.props.eventData.data.yelpSearchResultForEvent).length}
              </div>
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
      {view} 
    </div>
  )
  }
}