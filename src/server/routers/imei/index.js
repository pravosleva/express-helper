const express = require('express')
// const bodyParser = require('body-parser')
// const jsonParser = bodyParser.json()

const router = express()
const checkRoute = require('./mws/check')
const deviceRoute = require('./mws/device')
const randomRoute = require('./mws/random')

router.get('/check', checkRoute)
router.get('/device', deviceRoute)
router.get('/random', randomRoute)

module.exports = router
