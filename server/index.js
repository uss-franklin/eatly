const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const eventController = require('./controllers/eventController.js');
const frontEndCatchAllRouter = require('./controllers/frontEndController.js');
const gmailAuthenticationController = require('./controllers/gmailAuthenticationController.js');

const gmailCredentials = {
    clientId: require('./keys/gmailOAuthKeys.js').clientID,
    clientSecret: require('./keys/gmailOAuthKeys.js').clientSecret,
    redirectUrl: require('./keys/gmailOAuthKeys.js').redirectURL
};

//Initialize server and middleware
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Static Routes
app.use(express.static(path.resolve(__dirname + '/../client/public/')));
app.post('/createEvent', eventController.createEvent);
app.get('/getRestaurants', eventController.getEventRestaurants);
app.post('/vote', eventController.submitVote);
app.get('/authcode', gmailAuthenticationController.handleAuthorizationCallBack);


//Catch-all to allow refreshing of react-router created pages
app.get('/*', frontEndCatchAllRouter);

gmailAuthenticationController.authorize(gmailCredentials).then((oauth2Credentials) => {
    console.log(oauth2Credentials.credentials);
});







module.exports = app;
