import React from 'react'

export default class DeclineEvent extends React.Component {
    constructor(props){
        super(props);
    };
    render(){
        return (
            <div id="restaurantcontainer">
                <img id="leftcolumn" src={this.props.image} />
                <div id="rightcolumn">
                    <h4>{this.props.name}</h4>
                    <h4>{this.props.address}</h4>
                    <h4>{this.props.rating} stars</h4>
                </div>
            </div>

        )
    }
}