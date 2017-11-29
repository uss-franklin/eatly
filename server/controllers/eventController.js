const admin = require("firebase-admin");
const serviceAccount = require('../keys/firebaseKey.json');
const databaseURL = require('../keys/dbURL.js').dbURL;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

exports.createEvent = function(req, res){
    console.log('Event Controller Test');
    res.send('Event Controller Test');
}
