
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'team.eatly@gmail.com',
		pass: 'teameatlyhrnyc11'
	}
})

const mailOptions = {
	from: 'team.eatly@gmail.com',
	to: 'RJ.Barnett1@gmail.com',
	subject: 'TEST SUBJECT',
	html: '<h1>FUCK YEAH I WORK</h1>'
}

transporter.sendMail(mailOptions, function(err, info){
	if(err)
		console.log(err)
	else
		console.log(info)
})

// TEAM.EATLY@GMAIL.COM
// teameatlyhrnyc11