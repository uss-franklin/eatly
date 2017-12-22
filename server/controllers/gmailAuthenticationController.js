const readline = require('readline');
const googleAuth = require('google-auth-library');

const path = require('path');

const fs = require('fs');

const scopes = ['https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
];

const tokenPath = path.join(__dirname, '..', 'keys', 'gmailToken.json');

exports.handleAuthorizationCallBack = function(req, res){
    console.log(req.query.code);
    res.send();
};

let getNewToken = function(oauth2Client){
    let authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    console.log('Authorizes app by visiting this url: ', authUrl);

    let readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        readlineInterface.question('Enter the code from that page here: ',
            (code) => {
                readlineInterface.close();
                oauth2Client.getToken(code, (err, token) => {
                    if (err) {
                        return reject('Error while trying to retrieve access token', err);
                    }

                    oauth2Client.credentials = token;
                    storeToken(token).then((msg) => {
                        console.log(msg);
                    }).catch(err => {
                        console.error(err);
                    });
                    return resolve(oauth2Client);
                });
            });
    });
};

exports.authorize = function(credentials) {
    console.log(tokenPath);

    let clientId = credentials.clientId;
    let clientSecret = credentials.clientSecret;
    let redirectUrl = credentials.redirectUrl;

    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    let token;

    return new Promise((resolve, reject) => {
        // Try reading the existing token
        fs.readFile(tokenPath, function (err, token) {
            if (err) {
                // If there isn't an existing token, get a new one
                resolve(getNewToken(oauth2Client));
            } else {
                oauth2Client.credentials = JSON.parse(token);
                resolve(oauth2Client);
            }
        });
    });
};

let storeToken = function(token){
    return new Promise((resolve,reject) => {
        fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
            if(err){
                reject(err)
            }
            resolve('Token written to ', tokenPath);
        });
    });
};