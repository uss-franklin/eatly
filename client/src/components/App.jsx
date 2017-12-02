import React from 'react'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'

import Home from './Home'
import InputForm from './event_form/InputForm'
import Swipe from './Swipe'
import LoginForm from './login/LoginForm'
import Location from './location_form/Location'
import NavBar from './NavBar'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      firebaseAuthenticatedUser: ''
    }
  }
  grabFirebaseUser(firebaseUser){
    this.setState({firebaseAuthenticatedUser: firebaseUser}, () => console.log(this.state))
  }

  render() {
    // console.log(this.props)
    return (

    <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route exact path="/LoginForm" render={() => <LoginForm isAuthenicated={this.grabFirebaseUser.bind(this)}/>} />
      <Route exact path="/inputForm" component={InputForm} /> 
      <Route exact path="/swipe" component={Swipe} />
    </div>
  </Router>
    )
  }
}