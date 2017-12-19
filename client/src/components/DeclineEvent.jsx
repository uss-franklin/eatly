import React from 'react'
import Axios from 'axios'
import QueryString from 'query-string'
import RestaurantView from './RestaurantView.jsx'

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



    /*isValidEventUser(){
        if(!this.state.eventId || !this.state.userId){
            console.log('no eventID or userID');
            console.log('Event ID: ', this.state.eventId, 'User ID: ', this.state.userId);
            this.setState({validEventUser: false});
        } else {
            Axios.get(`/validateURL?userId=${this.state.userId}&eventId=${this.state.eventId}`)
            .then((val) => console.log(val))
            .catch((err) => 'Uh-oh')
        }
    }*/

    render(){
        let view = null;
        let restaurantCount = 0;
        let restaurantViews = [];
        let yelpResult = this.state.eventDetails.yelpSearchResultForEvent;
        while(yelpResult && yelpResult[restaurantCount] && restaurantCount < 3){
            restaurantViews.push(<RestaurantView name={yelpResult[restaurantCount].name} image={yelpResult[restaurantCount].image_url} address={yelpResult[restaurantCount].location.display_address.join(' ')} rating={yelpResult[restaurantCount].rating} />)
            restaurantCount++;
        }

        if(this.state.eventDetails && !this.state.declined){
            console.log('CHECKING STATE: ', this.state.eventName,' ', this.state.eventDescription);
            view = <div>
                <h1>
                    <div> You're busy... We get it </div>
                    <div> But are you sure you can't attend this event?</div>
                </h1>
                <div>
                    {this.state.eventName}<br />
                    {this.state.eventDescription}
                </div>
                <h2> You could be dining at these restaurants (or others)...</h2>
                {restaurantViews}
                <h2> So what's your final decision?</h2>
                <button className="startNewMealButtonResultsComponent" onClick={() => {window.location = `/Swipe?eventKey=${this.state.eventId}&userId=${this.state.userId}`}}>
                    Ok, I'll Go
                </button>
                <button className="startNewMealButtonResultsComponent" onClick={() => this.declineEvent()}>
                    Can't Make It
                </button>
            </div>
        } else if (this.state.declined && !this.state.goToInputForm) {
            view = <div>
                <h1>
                    <div>Thanks for the heads-up!</div>
                    <div> We'll let the event organizer know you can't attend</div>
                </h1>
                <div> You couldn't make this one, but you can always plan your own night of fun<br /><br /></div>
                <button className="startNewMealButtonResultsComponent" onClick={() => {window.location = `/InputForm`}}>
                    Plan Event
                </button>
            </div>
        } else {
            console.log(this.state);
            view = <div>Houston... We have a problem</div>
        }





        return view
    };
}
