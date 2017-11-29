const express = require('express')
const path = require('path')
const bodyParser= require('body-parser')

//Initialize server and middleware
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//Static Routes
app.use(express.static(path.resolve(__dirname + '/../client/public/')))


module.exports = app
