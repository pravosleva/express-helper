const express = require('express')

const reCAPTCHA = express()
const bodyParser = require('body-parser')
const verifyRoute = require('./mws/verify')

reCAPTCHA.use(bodyParser.urlencoded({ extended: false }))
reCAPTCHA.use(bodyParser.json())

reCAPTCHA.post('/verify', verifyRoute)

module.exports = reCAPTCHA
