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
    this.checkifConsensus = this.checkifConsensus.bind(this)
    this.setGuestList = this.setGuestList.bind(this)
    this.getInviteeinfo = this.getInviteeinfo.bind(this)
    this.votingExpired = this.votingExpired.bind(this)
    this.parseUser = this.parseUser.bind(this)
    
  }
  //records a no vote on a restaurant 
  //VOTING 0,1,2,3
  noVote() {
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: 1}
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
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: 2}
    Axios.post('/vote', voteObj)
      .then((response) => {
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
      vote: 3}
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
      vote: 0}
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
    Axios.post('/calculateConsensus', {eventId: this.state.eventKey, 
      userId: this.state.eventId, 
      restaurantId:this.state.current, vote: true 
    })
      .then((response) => {
        // console.log('lastClicktrue res', response)
        this.setState({consensus: true})
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  lastClickFalse(){
    Axios.post('/calculateConsensus', {eventId: this.state.eventKey, 
      userId: this.state.userId, 
      restaurantId: this.state.current, vote: false 
    })
      .then((response) => {
        this.setState({consensus: true})
        console.log('lastClick resfalse', response)
      })
      .catch((err) => {console.log('lastClick error', err)})
  }
  checkifConsensus(eid) {
    Axios.get(`/getSingleEvent?eid=${eid}`).then((resp) => {
      if (resp.data.groupConsensusRestaurant) {
        this.setState({consensus: true}, () => {
          console.log('consensus set')
        })
      }
    })  
      .catch(err => console.log('event details error', err))
  }
  setGuestList(eid) {
    Axios.get(`/getSingleEvent?eid=${eid}`)
      .then((response) => {
        let userkeys = []
        if (QueryString.parse(location.search).userId !== this.state.data.data.eventHost) {
          userkeys = [this.state.data.data.eventHost]
        } 
        for (var key in response.data.eventInvitees) {
          if (key !== QueryString.parse(location.search).userId)
          userkeys.push(key)
        }
        console.log('setGuestList running', userkeys)
        userkeys.map((key) => {
          this.getInviteeinfo(key)
        })
      })
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
    console.log('parse user')
    this.setState({userId: parsedqs.userId})
    Axios.get('/getRestaurants?eventKey=' + parsedqs.eventKey + '&userId=' + parsedqs.userId)
      .then((response) => {
        let arr = Object.keys(response.data.yelpSearchResultForEvent)
        if (arr.length > 0) {
        this.setState({eventKey: parsedqs.eventKey, data: response, 
          current: Number(Object.keys(response.data.yelpSearchResultForEvent)[0]),
          totalRestaurants: Number(arr[arr.length - 1])
        })
      } else {
        this.setState({eventKey: parsedqs.eventKey, data: response, 
        current: 2, totalRestaurants: 1})
      }
      this.setGuestList(this.state.eventKey)
      this.checkifConsensus(this.state.eventKey)
      })
      .catch((err) => console.log(err))
  }

  render() {
    // console.log('new state', this.state)
    // console.log('new props', this.props)
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
        console.log('swipe state', this.state)
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
              <button className="noButton" onClick={() => this.veto()}>
              <img src="./images/ld.jpg" />
                Veto
              </button>
              <button className="noButton" onClick={() => this.noVote() }>
                <img src="./images/redx.png"/>
              </button>
              <button className="yesButton" onClick={() => this.superLike()}>
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