const google = require('googleapis');
const gmail = google.gmail('v1');
const Base64 = require('js-base64').Base64;

exports.makePlainTextEmail = function(to, from, subject, body){
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

exports.sendEmail = function(oauth2Credentials, email){
    gmail.users.messages.send({userId: 'me',
        auth: oauth2Credentials,
        resource: {
            raw: email
        }}, (err, messageResource) => {
        console.log(messageResource);
    });
};