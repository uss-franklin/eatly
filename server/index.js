const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const eventController = require('./controllers/eventController.js');
const frontEndCatchAllRouter = require('./controllers/frontEndController.js');
const gmailAuthenticationController = require('./controllers/gmailAuthenticationController.js');
const voteController = require('./controllers/voteController.js');
const createAuthUser = require('./controllers/userController.js').createAuthUser;
const editEvent = require('./controllers/editEventController.js').editEvent;
const getAuthUserCreatedEvents = require('./controllers/getEventsController').getAuthUserCreatedEvents;
const getUserDetails = require('./controllers/userController.js').getUserDetails;

const gmailCredentials = {
    clientId: require('./keys/gmailOAuthKeys.js').clientID,
    clientSecret: require('./keys/gmailOAuthKeys.js').clientSecret,
    redirectUrl: require('./keys/gmailOAuthKeys.js').redirectURL
};

//Initialize server and middleware
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname + '/../client/public/')));

//Routes
app.post('/createEvent', eventController.createEvent);
app.post('/messages', eventController.sendInviteSMS);
app.get('/getRestaurants', eventController.getEventRestaurants);
app.get('/authcode', gmailAuthenticationController.handleAuthorizationCallBack);
app.post('/vote', voteController.voteOnRestaurant);
app.post('/voteAndGetConsensus', voteController.voteAndCheckForConsensus);
app.post('/createAuthUser', createAuthUser);
app.post('/editEvent', editEvent);
app.get('/getEvents', getAuthUserCreatedEvents);
app.get('/getUserDetails', getUserDetails);



//Catch-all to allow refreshing of react-router created pages
app.get('/*', frontEndCatchAllRouter);

/*gmailAuthenticationController.authorize(gmailCredentials).then((oauth2Credentials) => {
    console.log(oauth2Credentials.credentials);
});*/

cron.schedule('* * * * *', () => {
    console.log('>>>>>>>>>>>>>>>');
    console.log('running cron.... (Every minute)');
    voteController.getConsensusOnEventsPastCutOff();
    console.log('cron complete...');
    console.log('>>>>>>>>>>>>>>>');
});






module.exports = app;
