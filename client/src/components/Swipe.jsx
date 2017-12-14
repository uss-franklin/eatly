import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import QueryString from 'query-string'
import Results from './Results'

export default class Swipe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: null,
      totalRestaurants: null,
      consensus: false
    }

    this.noVote = this.noVote.bind(this)
    this.yesVote = this.yesVote.bind(this)
    this.lastClickTrue = this.lastClickTrue.bind(this)
    this.lastClickFalse = this.lastClickFalse.bind(this)
    this.votingExpired = this.votingExpired.bind(this)
    this.parseUser = this.parseUser.bind(this)
    
  }
  //records a no vote on a restaurant 
  noVote() {
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: false}
    Axios.post('/vote', voteObj)
      .then((response) => {
        // console.log('noVote res', response)
        let num = ++this.state.current
        this.setState({current: num}, () => {
          
          if (this.state.current  > this.state.totalRestaurants ) {
              this.lastClickFalse()
            }
        })
      })
      .catch((err) => { console.log(err)})
  }
  yesVote() {
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, vote: true}
    Axios.post('/vote', voteObj)
      .then((response) => {
        // console.log('yesVote res', response)
        let num = ++this.state.current;
        this.setState({current: num}, () => {
          if (this.state.current > this.state.totalRestaurants) {
            this.lastClickTrue()
          }
        })
      })
      .catch((err) => { console.log(err)})
  }
  //runs on the last restaurant vote, checks if everyone has voted, and if so, returns the winning restaurant
  lastClickTrue(){
    console.log('lastclick is working')
    console.log('last click eventid', this.state.eventKey )
    Axios.post('/calculateConsensus', {eventId: this.state.eventKey, 
      userId: this.state.eventId, 
      restaurantId:this.state.current, vote: true 
    })
      .then((response) => {
        // console.log('lastClick res', response)
        this.setState({consensus: true})
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  lastClickFalse(){
    // console.log('lastclick is working')
    // console.log('last click eventid', this.state.eventKey )
    Axios.post('/calculateConsensus', {eventId: this.state.eventKey, 
      userId: this.state.userId, 
      restaurantId: this.state.current, vote: false 
    })
      .then((response) => {
        this.setState({consensus: true})
        console.log('lastClick res', response)
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  //checks if the cutoff time for voting has passed
  votingExpired(current, cutoff) {
    cutoff = new Date(cutoff)
    return (current.valueOf() > cutoff.valueOf())
  }
  componentDidMount() {
      this.parseUser();
  }
  //gets the event data from the info in the url
  parseUser() {
    let parsedqs = QueryString.parse(location.search)
    console.log('parse user')
    this.setState({userId: parsedqs.userId})
    Axios.get('/getRestaurants?eventKey=' + parsedqs.eventKey + '&userId=' + parsedqs.userId)
      .then((response) => {
        // console.log('get req response', response)
        let arr = Object.keys(response.data.yelpSearchResultForEvent)
        this.setState({eventKey: parsedqs.eventKey, data: response, 
          current: Number(Object.keys(response.data.yelpSearchResultForEvent)[0]),
          totalRestaurants: Number(arr[arr.length - 1])
        }, () => {
        // console.log('state', this.state)
        })
      })
      .catch((err) => console.log(err))
  }

  render() {
    // console.log('new state', this.state)
    // console.log('new props', this.props)
    //view is used to display different views of the page: loading, swiping, and finished voting (from completion or cutoff time) 
    let view = null
      if (this.state.data === undefined) {
        view = 
          <div>
            <div className="loadingtext"> our minions are finding restaurants... </div>
            <img className="trex" src="./images/pasta.gif" />
          </div>
      }
      //if past cutoff time, there will be a result
      else if (this.votingExpired(new Date(), this.state.data.data.voteCutOffDateTime) === true) {
        view = <Results />
      } 
      //if curr > end && result exists, then show results page, below can be left as is
      else if (this.state.current > this.state.totalRestaurants && this.state.consensus === true) {
        view = <Results />
      } 
      else if (Object.keys(this.state.data.data.yelpSearchResultForEvent).length === 0 ) {
        view = <Results />
      }
      else if (this.state.current > this.state.totalRestaurants) {
          view = 
            <div> 
              <div className="endtext"> Thanks for voting, this page will display results for your event when everyone has voted </div>
              <img className="endphoto" src="./images/done.png" />
            </div> 
      }
      else {
        let restaurant = this.state.data.data.yelpSearchResultForEvent[this.state.current]
        let event = this.state.data.data
        let totalRestaurants = this.state.totalRestaurants + 1
        view = 
          <div className="swipeForm">
            <div className="eventtitle"> Event: <b>{event.eventName}</b> on {event.eventDateTime.slice(0,21)} </div>
            <div className="photoholder"> 
              <img className="photos" src={restaurant.image_url} />
              <div className="votecounter"> 
                Restaurant: {this.state.current + 1} of {totalRestaurants}
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
  
  return (
    <div> 
      {view} 
    </div>
  )
  }
}