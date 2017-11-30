import React from 'react'
import ReactDom from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import App from './components/App.jsx'
import InputForm from './components/InputForm'
//import LoginForm from './components/LoginForm.jsx'

ReactDom.render(
  <Router>
    <div>
      <Route exact path="/" component={App} />
      {/* <Route exact path="/LoginForm" component={LoginForm} /> */}
      <Route exact path="/inputForm" component={InputForm} /> 
    </div>
  </Router>,  
  document.getElementById('app'));