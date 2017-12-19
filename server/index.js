const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const eventController = require('./controllers/eventController.js');
const frontEndCatchAllRouter = require('./controllers/frontEndController.js');
const gmailAuthenticationController = require('./controllers/gmailAuthenticationController.js');
const voteController = require('./controllers/voteController2.js');
const {editEvent, deleteEvent}= require('./controllers/editEventController.js');
const {getAuthUserCreatedEvents, getSingleEvent} = require('./controllers/getEventsController');
const {getUserDetails, createAuthUser, getGroupInvitedUsersDetails} = require('./controllers/userController.js');
const finalResults = require('./controllers/resultsController.js')
const inviteEmailController = require('./controllers/inviteEmailController.js')

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
app.post('/calculateConsensus', voteController.calculateConsensus);
app.post('/createAuthUser', createAuthUser);
app.put('/editEvent', editEvent);
app.get('/getEvents', getAuthUserCreatedEvents);
app.get('/getUserDetails', getUserDetails);
app.get('/getGroupInvitedUsersDetails', getGroupInvitedUsersDetails);
app.get('/getSingleEvent', getSingleEvent);
app.delete('/deleteEvent', deleteEvent);
app.get('/finalYelpResult', finalResults.FinalYelpResult);
app.get('/declineInvite', eventController.declineInvite);
app.get('/validateURL', eventController.validateEventUser);
app.get('/getInvitee', finalResults.getInvitee);
app.get('/getUserSpecialVoteStatus', voteController.getUserSpecialVoteStatus);


//Catch-all to allow refreshing of react-router created pages
app.get('/*', frontEndCatchAllRouter);

/*gmailAuthenticationController.authorize(gmailCredentials).then((oauth2Credentials) => {
    console.log(oauth2Credentials.credentials);
});*/

/*cron.schedule('* * * * *', () => {
    console.log('>>>>>>>>>>>>>>>');
    console.log('running cron.... (Every minute)');
    voteController.getConsensusOnEventsPastCutOff();
    console.log('cron complete...');
    console.log('>>>>>>>>>>>>>>>');
});*/







module.exports = app;
