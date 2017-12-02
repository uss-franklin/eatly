
//to run this file and send the dummy texts for time being,
//run 'node tiliosms.js' in your terminal


  //TODO: interpolate dynamic to/from phone numbers and message body

const keys = require('./keys/twiliokeys.js')

//client requires the account keys saved in the gitignored keys folder
const client = require('twilio')(keys.accountSid, keys.authToken);

//when called this method sends SMS to the desired 'to' number
//'from' number always stays the same, it is the number registered on twilio acct
//'to' and 'body' fields can by dynamic
client.messages.create({
    to: '+18587616610',
    from: "+13473086897",
    body: "You've been invited to TeamFranklin's meal! Join the fun @ 10:00PM @ McDonald's. Click here to help find the perfect spot."
}).then((message) => console.log(message.sid));