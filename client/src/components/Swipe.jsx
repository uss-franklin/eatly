import React from 'react'
import NavBar from './NavBar'

var data = ['http://www.ozarlington.com/wp-content/uploads/2017/04/bar-buffet.jpg', 
            'https://awscloudfront.kempinski.com/2646/slider_isttugrarestaurantinteriorl.jpg;width=1024;height=576;mode=crop;anchor=middlecenter;autorotate=true;quality=90;scale=both;progressive=true;encoder=freeimage',
            'http://parkresto.com/wp-content/themes/parkrestaurant/images/11onlinereservationpark.jpg',
            'https://assets.bonappetit.com/photos/577e931f753d41914efc2360/16:9/w_1200,c_limit/the-dabney-dc-restaurant-kitchen-ASHLEY%2520ZINK%2520J36A8258-298.jpg']

var addData = []

export default class Swipe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0
    }
  }
  goToNext() {
    var num = ++this.state.current;
    this.setState({current: num})
    console.log(this.state.current)
    console.log(addData)
  }

  addRestaurant() {
    addData.push(data[this.state.current])
    var num = ++this.state.current;
    this.setState({current: num})
    console.log(addData)
  }
  render() {
    // console.log(this.props)
    console.log(this.state)
    return (
      <div className="parent"> 
      <div className="swipeForm">
      <NavBar />
      <div> Event Name, Time and Date </div>
      <div> 
        <img className="photos" src={data[this.state.current]} />
      </div> 
      <div>
        {/* add in logic later to disable buttons and show a stock image when the swiping is over*/}
        <button className="noButton" onClick={() => this.goToNext()}>
          <img src="./images/redx.png"/>
        </button>
        <button className="yesButton" onClick={() => this.addRestaurant()}>
          <img src="./images/checkmark.png"/>
        </button>
      </div>
      <div className="descriptions"> Descriptions here </div>
      </div>
      </div>
    )
  }
}