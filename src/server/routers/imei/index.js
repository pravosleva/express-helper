const express = require('express')
// const bodyParser = require('body-parser')
// const jsonParser = bodyParser.json()

const router = express()
const checkRoute = require('./mws/check')
const deviceRoute = require('./mws/device')
const randomRoute = require('./mws/random')
const { getRandomFromList } = require('./mws/get-random-from-list')

router.get('/check', checkRoute)
router.get('/device', deviceRoute)
router.get('/random', randomRoute)
router.get('/get-random-from-list', getRandomFromList)

module.exports = router
