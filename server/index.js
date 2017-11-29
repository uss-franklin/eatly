const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const eventController = require('./controllers/eventController.js');


//Initialize server and middleware
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Static Routes
app.use(express.static(path.resolve(__dirname + '/../client/public/')));
app.post('/createEvent', eventController.createEvent);

app.listen(3000, () => {
    console.log('getting dinner on port 3000');
});


module.exports = app;
