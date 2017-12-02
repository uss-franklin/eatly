import React from 'react'
import ReactDom from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import App from './components/App'
import InputForm from './components/event_form/InputForm'
//import LoginForm from './components/LoginForm'
import Swipe from './components/Swipe'

ReactDom.render(
  <Router>
    <div>
      <Route exact path="/" component={App} />
      {/* <Route exact path="/LoginForm" component={LoginForm} /> */}
      <Route exact path="/inputForm" component={InputForm} /> 
      <Route exact path="/swipe" component={Swipe} />
    </div>
  </Router>,  
  document.getElementById('app'));