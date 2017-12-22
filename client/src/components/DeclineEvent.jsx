import React from 'react'
import Axios from 'axios'
import QueryString from 'query-string'
import RestaurantView from './RestaurantView.jsx'
import DateFormat from 'dateformat'

export default class DeclineEvent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            eventId: null,
            userId: null,
            eventDetails: {},
            goToSwipe: false,
            goToInputForm: false,
            declined: false
        };
    };

    getRestaurantDataForEvent(){
        Axios.get(`/getRestaurants?userId=${this.state.userId}&eventKey=${this.state.eventId}`)
        .then((response) => {
            console.log(response.data);
            this.setState({eventDetails: response.data})

        })
        .catch((err) => this.setState({hasEventDetails: false}));
    }

    parseQueryStringAndGetRestaurantData(){
        let parsedQueryString = QueryString.parse(location.search);
        console.log('parse', parsedQueryString);
        if(parsedQueryString.eventKey && parsedQueryString.userId){
            this.setState({eventId: parsedQueryString.eventKey, userId: parsedQueryString.userId}, this.getRestaurantDataForEvent);
        }
    };

    componentDidMount(){
        this.parseQueryStringAndGetRestaurantData();
    }

    declineEvent(){
        console.log('DECLINING EVENT');
        Axios.get( `/declineInvite?userId=${this.state.userId}&eventId=${this.state.eventId}`)
        .then((response) => {
            this.setState({declined: true});
        })
        .catch((err) => console.log('Error with declining invite: ', err))

    }

    render(){
        let view = null;
        let restaurantCount = 0;
        let restaurantViews = [];
        let yelpResult = this.state.eventDetails.yelpSearchResultForEvent;
        let buttonStyle = {marginRight: '2cm'};
        let headerStyle={color: 'white'/*'#C3CAD6'*/};
        while(yelpResult && yelpResult[restaurantCount] && restaurantCount < 4){
            restaurantViews.push(<RestaurantView name={yelpResult[restaurantCount].name} image={yelpResult[restaurantCount].image_url} address={yelpResult[restaurantCount].location.display_address.join(' ')} rating={yelpResult[restaurantCount].rating} />)
            restaurantCount++;
        }

        if(this.state.eventDetails && !this.state.declined){
            console.log('CHECKING STATE: ', this.state.eventDetails.eventName,' ', this.state.eventDetails.eventDescription);
            view = <div>
                <h1 class="title is-3"> You're busy... We get it! </h1>
                <h1 class="subtitle is-5"> But are you sure you can't attend this event?</h1>
                <article class="message articleFormat">
                    <div class="message-header">
                        <p><strong>Event Details</strong></p>
                    </div>
                    <div class="message-body">
                        <strong>Event Name: </strong> {this.state.eventDetails.eventName} <br />
                        <strong>Event Description: </strong> {this.state.eventDetails.eventDescription} <br />
                        <strong>Event Date: </strong> {this.state.eventDetails.eventDateTime ? DateFormat(new Date(this.state.eventDetails.eventDateTime), "dddd, mmmm dS, yyyy, h:MM:ss TT") : this.state.eventDetails.eventDateTime}
                    </div>
                </article>
                <h1 class="subtitle is-5"> You could be dining at these restaurants (or others)...</h1>
                <div class="restaurantColumn">
                {restaurantViews}
                </div>
                <h1 class="title is-3"> So what's your final decision?</h1>
                <div class="centered">
                    <a class="button" style={buttonStyle} onClick={() => this.declineEvent()}>
                        Can't Make It
                    </a>
                    <a class="button is-link" onClick={() => {window.location = `/Swipe?eventKey=${this.state.eventId}&userId=${this.state.userId}`}}>
                        Ok, I'll Go
                    </a>
                </div>
            </div>
        } else if (this.state.declined && !this.state.goToInputForm) {
            view = <div className="declineParent">
                    <div className="declineText">
                        <h1 class="title is-3" style={headerStyle}>Thanks for the heads-up!</h1> <br />
                            <h1 class="subtitle is-5" style={headerStyle}> We'll let the event organizer know you can't attend<br/><br/> <br/></h1>
                        <h1 class="title is-3" style={headerStyle}> You couldn't make this one, but you can always plan your own night of fun<br /><br /></h1>
                        <div class = "centered">
                            <a class="button is-link " style={buttonStyle} onClick={() => {window.location = `/InputForm`}}>
                                Plan An Event
                            </a>
                    </div>
                </div>
                <br />
            </div>
        } else {
            console.log(this.state);
            view = <div>Houston... We have a problem</div>
        }

        return view
    };
}
