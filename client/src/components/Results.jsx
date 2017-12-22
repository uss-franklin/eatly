import React from 'react'
import NavBar from './NavBar'
import Axios from 'axios'
import QueryString from 'query-string'
import MapWithAMarker from './location_form/MapWithAMarker.jsx'
import Loading from './Loading'


export default class Results extends React.Component {
	constructor(props) {
    super(props)
    this.state = {
      yelpLoaded: false,
    }

    this.parseUser = this.parseUser.bind(this)
    this.getEventDetails = this.getEventDetails.bind(this)
    this.getYelpDetails = this.getYelpDetails.bind(this)
    this.componentWillMount = this.componentWillMount.bind(this)
    this.convertTime24to12 = this.convertTime24to12.bind(this)
    this.InputForm = this.InputForm.bind(this)
    
	}
 
  parseUser() {
    let parsedqs = QueryString.parse(location.search)
    console.log('parsetest', typeof QueryString.parse(location.search).userId)
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
  InputForm() {
    window.location = `/InputForm`
  }
	render() {
    let address = ''
    let view = null
    if (this.state.yelpLoaded === false) {
      <Loading />
    } else {
      console.log('test props', this.props)
      console.log('event description: ', this.props.eventData.data.data.eventDescription)
      console.log('result state', this.state.results.url)
        view = 
          <div className="parent resultsComponent">
          <div className="results-Header">
          <h1 className="resultsTitle">
            <div className="congratsText">
              Congrats!
            </div>
            You're Gonna Eat!
          </h1>
          </div>
          <div className="nameAndDesc">
           <b> {this.props.eventData.data.data.eventName}</b><br /> 
            {this.props.eventData.data.data.eventDescription}
          </div>
          <br />
          <p className="resultsHeader">
            Get ready to meet your party at:
          </p>
          <h2 className="resultsRestaurantTitle">
            <a href={this.state.results.url}>{this.state.results.name} </a>
          </h2>
          <h2 className="resultsDateAndTime">
          {this.state.results.location.display_address.forEach((piece) => {
            address += piece + ' '
          })}
          {address}
          </h2>
          <h3 className="resultsDateAndTime">
            {this.state.data.data.eventDateTime.slice(0,15)} @ {this.convertTime24to12(this.state.data.data.eventDateTime.slice(16,24))}
          </h3>
          
          <div className="ResultsMapDiv">
              <MapWithAMarker
                  lat={this.state.results.coordinates.latitude}
                  lng={this.state.results.coordinates.longitude}
                  defaultZoom={17}
                  containerElement={<div style={{height: `300px`}}/>}
                  mapElement={<div style={{height: `100%`}}/>}
              />
          </div>
          <div className="inviteeVotesText">
            <p className="viewInviteeVotesText">
              {console.log('this.props guest test', this.props)}
              You'll be dining with: 
              {this.props.eventData.guests.map((guest)=>{
                return <li>{guest.data.name} </li>
              })} 
            </p>
          </div>
          <p className="startNewMealTextResultsComponent">
            <br />
            Get started planning another evening of fun!
          </p>
          <button className="startNewMealButtonResultsComponent" onClick={() => this.InputForm()}>
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
