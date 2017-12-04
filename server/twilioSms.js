
//to run this file and send the dummy texts for time being,
//run 'node tiliosms.js' in your terminal


  //TODO: interpolate dynamic to/from phone numbers and message body
  	//free tier of Twilio only allows verified numbers to be recipients of messages
  		//worth buying into a paid account?

const keys = require('./keys/twiliokeys.js')

//client requires the account keys saved in the gitignored keys folder
const client = require('twilio')(keys.accountSid, keys.authToken)

//when called this method sends SMS to the desired 'to' number
//'from' number always stays the same, it is the number registered on twilio acct
//'to' and 'body' fields can by dynamic
const inviteSMS = function() {
	client.messages.create({
	    to: '+14254083980',
	    from: "+13473086897",
	    body: "You've been invited to a meal with your friend! Help find the perfect spot now, with Eatly."
	}).then((message) => console.log(message.sid))
}

const resultsSMS = function() {
	client.messages.create({
		to: '+14254083980',
		from: '+13473086897',
		body: 'Congrats! Your meal has been planned with Eatly. See your results live on Eatly now!'
	}).then((message) => console.log(message.sid))
}

exports.inviteSMS = inviteSMS
exports.resultsSMS = resultsSMS