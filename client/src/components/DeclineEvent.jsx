import React from 'react'
import Axios from 'axios'
import QueryString from 'query-string'

export default class DeclineEvent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            eventId: null,
            userId: null,
            validEventUser: null,
        }
    };

    componentDidMount(){
        this.parseQueryString();
        this.isValidEventUser();
    };

    parseQueryString(){
        let parsedQueryString = QueryString.parse(location.search);
        console.log('parse', parsedQueryString);
        if(parsedQueryString.eventId && parsedQueryString.userId){
            this.setState({eventId: parsedQueryString.eventId, userId: parsedQueryString.userId});
            console.log('Event IDDDDDDDD', this.state.eventId);
        }
    };

    isValidEventUser(){
        if(!this.state.eventId || !this.state.userId){
            console.log('no eventID or userID');
            console.log('Event ID: ', this.state.eventId, 'User ID: ', this.state.userId);
            this.setState({validEventUser: false});
        } else {
            Axios.get(`/validateURL?userId=${this.state.userId}&eventId=${this.state.eventId}`)
            .then((val) => console.log(val))
            .catch((err) => 'Uh-oh')
        }
    }

    render(){
        console.log(this.state.eventId);
        return (<div>We're declining events!</div>);
    };
}
