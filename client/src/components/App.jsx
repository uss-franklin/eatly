import React from 'react'
import {BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom'
import Axios from 'axios'

import Home from './Home'
import InputForm from './event_form/InputForm'
import Swipe from './Swipe'
import LoginForm from './login/LoginForm'
import Location from './location_form/Location'
import NavBar from './NavBar'
import Account from './user/Account'
import EditEvent from './user/EditEvent'
import DeclineEvent from './DeclineEvent'
import firebase from './login/FirebaseAuth'
import queryString from 'query-string'


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      firebaseAuthenticatedUser: {uid: null},
    }
  }
  componentDidMount() {
    //listen for firebase logged in state
    this.authenticateUser.call(this)
  }
  
  authenticateUser(){
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				console.log('authenticateUser():true')
				//sets the state on the app to a logged in
				this.setState({firebaseAuthenticatedUser: user}) 
			} else {
				console.log('authenticateUser(): false')
				//sets the state on the app to a logged outed
				this.setState({firebaseAuthenticatedUser: {uid: null}})
			}
		})
	}

  render() {
    let loggedIn = this.state.firebaseAuthenticatedUser.uid !== null
    return (

  <Router>
    <div className="parent">
      <NavBar firebase={firebase} loggedIn={loggedIn}/>
      <Route exact path="/" component={Home} />
      <Route exact path="/loginForm" render={() => (
          loggedIn ?  <Redirect to="/account" /> : <LoginForm firebase={firebase}/>
        )} 
      />
      <Route exact path="/account" render={() => (
        loggedIn ? <Account user={this.state.firebaseAuthenticatedUser}/> : <Redirect to="/" />
        )} 
      />
      <Route exact path="/inputForm" render={() => 
          <InputForm 
            userAccountEmail={this.state.firebaseAuthenticatedUser.email}
            firebaseId={this.state.firebaseAuthenticatedUser.uid}
          />
        } 
      /> 
      <Route path="/swipe" component={Swipe}/>
      <Route path="/edit" component={EditEvent}/>
      <Route path="/decline" component={DeclineEvent}/>
    
    </div>
  </Router>
    )
  }
}