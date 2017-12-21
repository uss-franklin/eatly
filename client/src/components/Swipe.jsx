import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import QueryString from 'query-string'
import Results from './Results'
import MapWithAMarker from './location_form/MapWithAMarker.jsx'
import Loading from './Loading'
import Holder from './Holder'

export default class Swipe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: null,
      totalRestaurants: null,
      consensus: false,
      hasSuperLiked: false,
      hasVetoed: false,
      guests: [],
    }

    this.noVote = this.noVote.bind(this)
    this.yesVote = this.yesVote.bind(this)
    this.superLike = this.superLike.bind(this)
    this.veto = this.veto.bind(this)
    this.lastClickTrue = this.lastClickTrue.bind(this)
    this.lastClickFalse = this.lastClickFalse.bind(this)
    this.specialVotes = this.specialVotes.bind(this)
    this.checkifConsensus = this.checkifConsensus.bind(this)
    this.setGuestList = this.setGuestList.bind(this)
    this.getInviteeName = this.getInviteeName.bind(this)
    this.votingExpired = this.votingExpired.bind(this)
    this.parseUser = this.parseUser.bind(this)
    this.convertTime24to12 = this.convertTime24to12.bind(this)
    
  }
  //records a no vote on a restaurant 
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
          this.setState({current: num}, 
            () => {
            this.setState({hasSuperLiked: true})
            if (this.state.current > this.state.totalRestaurants) {
              this.lastClickTrue()
            }
          })
        })
        .catch(err => console.log('superlike error', err))
  }
  veto() {
    let voteObj = {eventId: this.state.eventKey, userId: this.state.userId, restaurantId: this.state.current, 
      vote: 0}
      Axios.post('/vote', voteObj)
        .then((response) => {
          let num = ++this.state.current
          this.setState({current: num}, () => {
            this.setState({hasVetoed: true})
            if (this.state.current > this.state.totalRestaurants) {
              this.lastClickFalse()
            }
          })
        })
        .catch(err => console.log('veto error', err))
  }
  //runs on the last restaurant vote, checks if everyone has voted, and if so, returns the winning restaurant and generates results page
  lastClickTrue(){
    Axios.post('/calculateConsensus', {eventId: this.state.eventKey, 
      userId: this.state.eventId, 
      restaurantId:this.state.current, vote: true 
    })
      .then((response) => {
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
  //checks in database if user has already vetoed or superliked - for the case when user opens a new session to complete voting
  specialVotes(){
    Axios.get('/getUserSpecialVoteStatus?userId=' +this.state.userId + '&eventId=' + this.state.eventKey)
      .then((response) => {
        if (response.data.hasSuperLiked === true) {
          this.setState({hasSuperLiked: true}, () => {
            console.log('has superliked')
          })
        }
        if (response.data.hasVetoed === true) {
          this.setState({hasVetoed: true}, () => {
            console.log('has vetoed')
          })
        }
      })
      .catch(err => {console.log('special votes error', err)})
  }
  //checks if consensus exists in database
  checkifConsensus(eid) {
    Axios.get(`/getSingleEvent?eid=${eid}`)
      .then((resp) => {
        if (resp.data.groupConsensusRestaurant) {
          this.setState({consensus: true}, () => {
            console.log('consensus set')
          })
        }
    })  
    .catch(err => console.log('event details error', err))
  }
  //generates guest list for the event and is passed to results page where it is displayed
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
        userkeys.map((key) => {
          this.getInviteeName(key)
        })
      })
  }
  //gets the guest name from the guest id
  getInviteeName(inviteeId) {
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
  //immediately grabs user data from url
  componentWillMount() {
      this.parseUser();
  }
  //gets the event data from the query string in the url
  parseUser() {
    let parsedqs = QueryString.parse(location.search)
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
      //sets the guest list, checks for event result and if user has used veto or superlike
      this.setGuestList(this.state.eventKey)
      this.checkifConsensus(this.state.eventKey)
      this.specialVotes()
      })
      .catch((err) => console.log('parseuser error: ', err))
  }
  convertTime24to12(time24){
    var tmpArr = time24.split(':'), time12;
    if ( +tmpArr[0] === 12 ) {
      time12 = tmpArr[0] + ':' + tmpArr[1] + ' pm';
    } else {
        if ( +tmpArr[0] === 0 + 0 ) {
          time12 = '12:' + tmpArr[1] + ' am';
      } else {
          if ( +tmpArr[0] > 12 ) {
            time12 = (+tmpArr[0]-12) + ':' + tmpArr[1] + ' pm';
        } else {
            time12 = (+tmpArr[0]) + ':' + tmpArr[1] + ' am';
          }
        }
      }
    return time12;
  }

  render() {
    //view var is used to display different views of the page: loading, swiping, and finished voting (from completion or cutoff time) 
    let view = null
      if (this.state.data === undefined) {
        <Loading />
      }
      //if past cutoff time, result page is shown
      else if (this.votingExpired(new Date(), this.state.data.data.voteCutOffDateTime) === true) {
        console.log('else if one')
        view = <Results eventData={this.state}/>
      } 
      //checks if there is already a consensus, displays results page if so 
      else if (this.state.current > this.state.totalRestaurants && this.state.consensus === true) {
        console.log('else if two')
        view = <Results eventData={this.state}/>
      } 
      //if no consensus, user is shown the holder page
      else if (this.state.current > this.state.totalRestaurants) {
        console.log('else if four')
          view = <Holder />
      } 
      //the swipe page 
      else {
        let restaurant = this.state.data.data.yelpSearchResultForEvent[this.state.current]
        let event = this.state.data.data
        let totalRestaurants = this.state.totalRestaurants + 1

        //once used, superlike and veto buttons are taken off the page
        let superLikeButton =  
          <button  className="superLikeButton" onClick={() => this.superLike()}>Superlike (1 Left)</button>

        let vetoButton = 
          <button className="vetoButton" onClick={() => this.veto()}>Veto (1 Left)</button>

        if (this.state.hasSuperLiked === true){
          superLikeButton = <button disabled={true} className="superLikeButton">Superlike </button>
        }
        if (this.state.hasVetoed === true) {
          vetoButton = <button disabled={true} className="vetoButton">Veto</button>
        }

        view = 
          <div className="swipeForm">
          <div className="eventTitleDiv">
            <div className="eventTitle"> <b>{event.eventName}</b> on {event.eventDateTime.slice(0,16) 
                + this.convertTime24to12(event.eventDateTime.slice(16,24))} </div>
            </div>
                
              <div className="swipeDiv">
                <div className="swipePhotoDiv">
                  <div className="vetoButtonDiv">{vetoButton}</div>
                  <div className="swipeImgDiv"><img className="swipePhoto" src={restaurant.image_url} /> </div>
                  <div className="superLikeButtonDiv">{superLikeButton}</div>
                </div>
                <div className="yesAndNoButtons">
                  <div className="noButtonDiv"><button className="noButton" onClick={() => this.noVote() }> No </button></div>
                  <div className="voteCounter">Restaurant: {this.state.current + 1} of {totalRestaurants} </div>
                  <div className="yesButtonDiv"><button className="yesButton" onClick={() => this.yesVote() }> Yes </button> </div>
                </div>
              </div>

            <br/>
            <div className="swipebackground">
              <div className="restuarantInfoDiv">
                <div className="restaurantDescription"> {restaurant.name} </div>
                <div className="restaurantDescription"> {restaurant.price} </div>
                <div className="restaurantDescription"> {restaurant.rating}/5 Rating</div>
                <div className="restaurantDescription"> {restaurant.review_count} Reviews </div>

                <br />

                <div className="restaurantDescription"> Voting ends {event.voteCutOffDateTime.slice(0,10) + ', '
                    + this.convertTime24to12(event.voteCutOffDateTime.slice(16,24))}
                </div>
              </div>
              <br/>
              <div className="MapWithAMarker">
                <MapWithAMarker
                    lat={restaurant.coordinates.latitude}
                    lng={restaurant.coordinates.longitude}
                    defaultZoom={16}
                    containerElement={<div style={{height: `400px`}}/>}
                    mapElement={<div style={{height: `100%`}}/>}
                />
              </div>
              <div>  here  </div>
            </div>
          </div>
      }
  
  return (
    <div> 
      {view} 
    </div>
  )
  }
}