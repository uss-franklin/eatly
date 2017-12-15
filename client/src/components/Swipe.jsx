import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import QueryString from 'query-string'
import Results from './Results'
import MapWithAMarker from './location_form/MapWithAMarker.jsx'
import Loading from './Loading'

export default class Swipe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: null,
      totalRestaurants: null,
      consensus: false,
      superLike: true,
      veto: true,
      guests: [],
    }

    this.noVote = this.noVote.bind(this)
    this.yesVote = this.yesVote.bind(this)
    this.superLike = this.superLike.bind(this)
    this.veto = this.veto.bind(this)
    this.lastClickTrue = this.lastClickTrue.bind(this)
    this.lastClickFalse = this.lastClickFalse.bind(this)
    this.getEventDetails = this.getEventDetails.bind(this)
    this.getInviteeinfo = this.getInviteeinfo.bind(this)
    this.votingExpired = this.votingExpired.bind(this)
    this.parseUser = this.parseUser.bind(this)
    
  }
  //records a no vote on a restaurant 
  //VOTING 0,1,2,3
  noVote() {
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: false}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('noVote res', response)
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
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: true}
    Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('yesVote res', response)
        let num = ++this.state.current;
        this.setState({current: num}, () => {
          if (this.state.current > this.state.totalRestaurants) {
            this.lastClickTrue()
          }
        })
      })
      .catch((err) => { console.log(err)})
  }
  superLike() {
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: 2}
      Axios.post('/vote', voteObj)
        .then((response) => {
          let num = ++this.state.current
          this.setState({current: num}, () => {
            this.setState({superLike: false})
            if (this.state.current > this.state.totalRestaurants) {
              this.lastClickTrue()
            }
          })
        })
  }
  veto() {
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: -1}
      Axios.post('/vote', voteObj)
        .then((response) => {
          let num = ++this.state.current
          this.setState({current: num}, () => {
            this.setState({veto: false})
            if (this.state.current > this.state.totalRestaurants) {
              this.lastClickFalse()
            }
          })
        })
  }
  //runs on the last restaurant vote, checks if everyone has voted, and if so, returns the winning restaurant
  lastClickTrue(){
    console.log('last click eventid', this.state.eventKey )
    Axios.post('/calculateConsensus', {eventId: this.state.eventKey, 
      userId: this.state.eventId, 
      restaurantId:this.state.current, vote: true 
    })
      .then((response) => {
        console.log('lastClick res', response)
        this.setState({consensus: true})
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  lastClickFalse(){
    // console.log('lastclick is working')
    console.log('last click eventid', this.state.eventKey )
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
  getEventDetails(eid) {
    Axios.get(`/getSingleEvent?eid=${eid}`).then((resp) => {
      if (resp.data.groupConsensusRestaurant) {
        this.setState({consensus: true}, () => {
          //to get userkeys, and then user info objects
          let userkeys = []
          if (QueryString.parse(location.search).userId !== this.state.data.data.eventHost) {
            userkeys = [this.state.data.data.eventHost]
          } 
          let names = []
          for (var key in resp.data.eventInvitees) {
            if (key !== QueryString.parse(location.search).userId)
            userkeys.push(key)
          }
          console.log('userkeys', userkeys)
          userkeys.map((key) => {
            names.push(this.getInviteeinfo(key))
          })
        })
      }
    })  
      .catch(err => console.log('event details error', err))
  }
  getInviteeinfo(inviteeId) {
    Axios.get('/getInvitee?inviteeId=' + inviteeId)
      .then((response) => {
        this.state.guests.push(response)
      })
      .catch(err => console.log('invitee error', err))
  }
  //checks if the cutoff time for voting has passed
  votingExpired(current, cutoff) {
    cutoff = new Date(cutoff)
    return (current.valueOf() > cutoff.valueOf())
  }
  componentWillMount() {
      this.parseUser();
  }
  //gets the event data from the info in the url
  parseUser() {
    let parsedqs = QueryString.parse(location.search)
    console.log('parse', parsedqs)
    this.setState({userId: parsedqs.userId})
    Axios.get('/getRestaurants?eventKey=' + parsedqs.eventKey + '&userId=' + parsedqs.userId)
      .then((response) => {
        let arr = Object.keys(response.data.yelpSearchResultForEvent)
        if (arr.length > 0) {
        this.setState({eventKey: parsedqs.eventKey, data: response, 
          current: Number(Object.keys(response.data.yelpSearchResultForEvent)[0]),
          totalRestaurants: Number(arr[arr.length - 1])
        }, () => {
        console.log('state', this.state)
        })
      } else {
        this.setState({eventKey: parsedqs.eventKey, data: response, 
        current: 2, totalRestaurants: 1})
      }
      this.getEventDetails(this.state.eventKey)
      })
      .catch((err) => console.log(err))
  }

  render() {
    console.log('new state', this.state)
    console.log('new props', this.props)
    //view is used to display different views of the page: loading, swiping, and finished voting (from completion or cutoff time) 
    let view = null
      if (this.state.data === undefined) {
        <Loading />
      }
      //if past cutoff time, there will be a result
      else if (this.votingExpired(new Date(), this.state.data.data.voteCutOffDateTime) === true) {
        console.log('else if one')
        view = <Results eventData={this.state}/>
      } 
      //if curr > end && result exists, then show results page, below can be left as is
      else if (this.state.current > this.state.totalRestaurants && this.state.consensus === true) {
        console.log('else if two')
        view = <Results eventData={this.state}/>
      } 
      else if (Object.keys(this.state.data.data.yelpSearchResultForEvent).length === 0 && this.state.consensus === true) {
        console.log('else if three')
        view = <Results eventData={this.state}/>
      }
      else if (this.state.current > this.state.totalRestaurants) {
        console.log('else if four')
          view = 
            <div> 
              <div className="endtext"> Thanks for voting, this page will display results for your event when everyone has voted </div>
              <img className="endphoto" src="./images/done.png" />
            </div> 
      } 
      else {
        console.log('ekey', this.state.eventKey)
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
              <button className="noButton" onClick={() => console.log('veto')}>
              <img src="./images/ld.jpg" />
                Veto
              </button>
              <button className="noButton" onClick={() => this.noVote() }>
                <img src="./images/redx.png"/>
              </button>
              <button className="yesButton" onClick={() => console.log('superlike')}>
                <img src="./images/fire.png" />
                SuperLike
              </button>
              <button className="yesButton" onClick={() => this.yesVote() }>
                <img src="./images/checkmark.png"/>
              </button>
              
            </div>
            <div className="descriptions"> {restaurant.name} </div>
            <div className="descriptions"> Price: {restaurant.price} </div>
            <div className="descriptions"> Rating: {restaurant.rating}/5 </div>
            <div className="descriptions"> Number of Reviews: {restaurant.review_count} </div>
            <div>
              <MapWithAMarker
                  lat={restaurant.coordinates.latitude}
                  lng={restaurant.coordinates.longitude}
                  defaultZoom={16}
                  containerElement={<div style={{height: `400px`}}/>}
                  mapElement={<div style={{height: `100%`}}/>}
              />
            </div>
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