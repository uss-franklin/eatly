import React from 'react'
import ReactDom from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import App from './components/App.jsx'
// import inputForm from './components/inputForm.jsx'
//import LoginForm from './components/LoginForm.jsx'

ReactDom.render(
  <Router>
    <div>
      <Route exact path="/" component={App} />
      {/* <Route exact path="/LoginForm" component={LoginForm} /> */}
      {/* <Route path="/inputForm" component={inputForm} />  */}
    </div>
  </Router>,  
  document.getElementById('app'));