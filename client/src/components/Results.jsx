import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import QueryString from 'query-string'

export default class Results extends React.Component {
	constructor(props) {
    super(props)
    this.state = {
      yelpLoaded: false
    }

    this.parseUser = this.parseUser.bind(this)
    this.getEventDetails = this.getEventDetails.bind(this)
    this.getYelpDetails = this.getYelpDetails.bind(this)
    this.componentWillMount = this.componentWillMount.bind(this)
    
	}
 
  parseUser() {
    let parsedqs = QueryString.parse(location.search)
    this.setState({eventId: parsedqs.eventKey}, () => {
      this.getEventDetails(this.state.eventId)
    })
  }
  getEventDetails(eid) {
    return Axios.get(`/getSingleEvent?eid=${eid}`).then((resp) => {
      this.setState({data: resp}, () => {
        this.getYelpDetails(resp.data.yelpSearchResultsKey)
      })  
    })
    .catch(err => console.log('event details error', err))
  }
  getYelpDetails(yelpResultsKey) {
    return Axios.get('/finalYelpResult?yelpKey=' + yelpResultsKey)
      .then((response) => {
        this.setState({results: response.data[Number(this.state.data.data.groupConsensusRestaurant)]}, () => {
          this.setState({yelpLoaded: true})
        })
      })
      .catch(err => console.log('yelp details error', err))
  }
  componentWillMount() {
    this.parseUser()
  }
	render() {
    let view = null
    if (this.state.data === undefined || this.state.yelpLoaded === false) {
      view = 
        <div>
          <div className="loadingtext"> our minions are finding restaurants... </div>
          <img className="trex" src="./images/pasta.gif" />
      </div>
    } else {
      console.log('new result test', this.state.results)
        view = 
          <div className="parent resultsComponent">
          <h1 className="resultsTitle">
            <div className="congratsText">
              Congrats!
            </div>
            You're Gonna Eat!
          </h1>
          <p className="resultsHeader">
            Get ready to meet your party at:
          </p>
          <h2 className="resultsRestaurantTitle">
            {this.state.results.name}
          </h2>
          <h2 className="resultsDateAndTime">
          {this.state.results.location.address1}
          </h2>
          <h3 className="resultsDateAndTime">
            {this.state.data.data.eventDateTime.slice(0,15)} @ {this.state.data.data.eventDateTime.slice(16,24)}
          </h3>
          <p className="viewInviteeVotesText">
            Want to see who you're gonna be dining with, and how they voted?
          </p>
          <button className="viewInviteesVotesButton">
            Guests
          </button>
          <p className="startNewMealTextResultsComponent">
            <br />
            <br />
            Get started planning another evening of fun!
          </p>
          <button className="startNewMealButtonResultsComponent">
            Plan Event
          </button>
        </div>
      }
    

		return (
      <div>
        {view}
      </div>
			)
	}
}
