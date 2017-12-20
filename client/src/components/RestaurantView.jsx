import React from 'react'

export default class DeclineEvent extends React.Component {
    constructor(props){
        super(props);
    };
    render(){
        let imageLocation = './images/Yelp/web_and_ios/regular/regular_' + this.props.rating + '.png';
        console.log('IMAGE LOCATION', imageLocation);
        return (
            <div class="centered">
                <div class="frame-square">
                    <div class="crop">
                        <img src={this.props.image} alt="" />
                    </div>
                </div>
                <div class="box">
                    <p>
                        <strong>{this.props.name}</strong>
                        <br />
                        <img src={imageLocation} />
                        <br />
                        {this.props.address}
                    </p>
                </div>
                <br />
            </div>
        )
    }
}