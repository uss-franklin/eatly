//Requires significant refactoring and integration

const readline = require('readline');
const google = require('googleapis');
const gmail = google.gmail('v1');
const googleAuth = require('google-auth-library');
const Base64 = require('js-base64').Base64;

const fs = require('fs');

const scopes = ['https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
];

const credentials = {
    clientId: require('./keys/googleOAuth.js').clientID,
    clientSecret: require('./keys/googleOAuth.js').clientSecret,
    redirectUrl: require('./keys/googleOAuth.js').redirectURL
};

const tokenPath = './keys/token.js';

let authorize = function(credentials) {

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
                    storeToken(token);
                    return resolve(oauth2Client);
                });
            });
    });
};

let storeToken = function(token){
    fs.writeFile(tokenPath, JSON.stringify(token));
    console.log('Token written to ' + tokenPath);
};

let makePlainTextEmail = function(to, from, subject, body){
    let email = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        body
    ].join('');

    return Base64.encodeURI(email);
};

let sendEmail = function(oauth2Credentials, email){
    gmail.users.messages.send({userId: 'me',
        auth: oauth2Credentials,
        resource: {
            raw: email
        }}, (err, messageResource) => {
        console.log(messageResource);
    });
};

authorize(credentials).then((oauth2Credentials) => {
    console.log(oauth2Credentials.credentials);
    sendEmail(oauth2Credentials, makePlainTextEmail('sakinyooye@gmail.com','team.eatly@gmail.com', 'How about lunch?', 'We selected a restaurant for you'));
});