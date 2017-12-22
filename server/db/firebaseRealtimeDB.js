const admin = require("firebase-admin");
const serviceAccount = require('../keys/firebaseKey.json');
const databaseURL = require('../keys/dbURL.js').dbURL;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

var db = admin.database();
exports.dbRef = db.ref('eatly');