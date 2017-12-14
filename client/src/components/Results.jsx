import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import QueryString from 'query-string'
import MapWithAMarker from './location_form/MapWithAMarker.jsx'

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
    let address = ''
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
          {this.state.results.location.display_address.forEach((x) => {
            address += x + ' '
            return address
          })}
          {address}
          </h2>
          <h3 className="resultsDateAndTime">
            {this.state.data.data.eventDateTime.slice(0,15)} @ 
            {this.convertTime24to12(this.state.data.data.eventDateTime.slice(16,24))}
          </h3>
          <div>
              <MapWithAMarker
                  lat={this.state.results.coordinates.latitude}
                  lng={this.state.results.coordinates.longitude}
                  defaultZoom={18}
                  containerElement={<div style={{height: `400px`}}/>}
                  mapElement={<div style={{height: `100%`}}/>}
              />
          </div>
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
