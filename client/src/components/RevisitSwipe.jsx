import React from 'react'
import Axios from 'axios'

export default class RevisitSwipe extends React.Component {
  constructor(props) {
    super(props) 
    this.state = {
      currentRes: 0,
      endNum: null
    }

    this.guestNoVote = this.guestNoVote.bind(this)
    this.guestYesVote = this.guestYesVote.bind(this)
    this.guestLastClickFalse = this.guestLastClickFalse.bind(this)
    this.guestLastClickTrue = this.guestLastClickTrue.bind(this)
    this.votingExpired = this.votingExpired.bind(this)
    this.componentWillMount = this.componentWillMount.bind(this)
   
  }


  guestNoVote() {
    let voteObj = {eventId: this.props.eventinfo.eventKey, userId: this.props.eventinfo.userId,
      restaurantId: this.state.currentRes, vote: false }
      Axios.post('/vote', voteObj)
      .then((response) => {
        console.log('noVote res', response)
        let num = ++this.state.currentRes
        this.setState({currentRes: num}, () => {
          if (this.state.currentRes > this.state.endNum) {
            this.guestLastClickFalse()
          }
          console.log('guestNoVotestate', this.state)
        })
      })
      .catch((err) => {console.log('guestNoVote error', err)})
  }
  guestYesVote() {
    let voteObj = {eventId: this.props.eventinfo.eventKey, userId: this.props.eventinfo.userId,
      restaurantId: this.state.currentRes, vote: true }
      Axios.post('/vote', voteObj)
        .then((response) => {
          console.log('guestYesVote resp', response)
          let num = ++this.state.currentRes
          this.setState({currentRes: num}, () => {
            if (this.state.currentRes > this.state.endNum) {
              this.guestLastClickTrue()
            }
            console.log('guestYesVotestate', this.state)
          })
        })
        .catch((err) => {console.log('guestYesVote error', err)})
  }
  guestLastClickFalse() {
    Axios.post('/calculateConsensus', {eventId: this.props.eventinfo.eventKey, userId: this.props.eventinfo.userID , restaurantId, vote: false})
      .then((response) => {
        console.log('guestlastclick false', response)
      })
      .catch((err) => {console.log('lastclick false error', error)})
  }
  guestLastClickTrue() {
    Axios.post('/calculateConsensus', {eventId: this.props.eventinfo.eventKey, userId: this.props.eventinfo.userId, restaurantId: this.state.currentRes, vote: true})
    .then((response) => {
      console.log('guestlastclick true', response)
    })
    .catch((err) => {console.log('lastclick true error', error)})
  }
  votingExpired(current, cutoff) {
    cutoff = new Date(cutoff)
    return (current.valueOf() > cutoff.valueOf())
  }
  componentWillMount() {
    this.state.currentRes = Number(Object.keys(this.props.eventinfo.data.data.yelpSearchResultForEvent)[0])
    console.log('cdidmount', this.state.currentRes)
    let arr = Object.keys(this.props.eventinfo.data.data.yelpSearchResultForEvent)
    this.state.endNum = Number(arr[arr.length - 1])
    console.log("this.state.endNum", this.state.endNum)
  }


  render() {
    console.log('current res', this.state.currentRes)
    console.log('props',this.props)
    console.log('state', this.state)

    let view = null

    if (this.props.eventinfo === undefined) {
      view = 
        <div>
          <div className="loadingtext"> our minions are finding restaurants... </div>
          <img className="trex" src="./images/pasta.gif" />
        </div>
    } else if (this.votingExpired(new Date(), this.props.eventinfo.data.data.voteCutOffDateTime) === true) {
      view = 
        <div> 
          <div className="endtext"> Thanks for voting, this page will display results for your event when everyone has voted </div>
          <img className="endphoto" src="./images/done.png" />
        </div> 
  }  else if (this.state.currentRes > this.state.endNum) { 
          view = 
            <div> 
              <div className="endtext"> Thanks for voting, this page will display results for your event when everyone has voted </div>
              <img className="endphoto" src="./images/done.png" />
            </div> 
  }
  else {
    let restaurant = this.props.eventinfo.data.data.yelpSearchResultForEvent[this.state.currentRes]
    let event = this.props.eventinfo.data.data
    let total = this.state.endNum + 1
    view = 
      <div className="swipeForm">
        <div className="eventtitle"> Event: <b>{event.eventName}</b> on {event.eventDateTime.slice(0,21)} </div>
        <div className="photoholder"> 
          <img className="photos" src={restaurant.image_url} />
          <div className="votecounter"> 
            Restaurant: {this.state.currentRes + 1} of {total}
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