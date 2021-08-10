const express = require('express')

const gcsApi = express()
const bodyParser = require('body-parser')
const addUserRoute = require('./mws/add-user')
const getUsersMapRoute = require('./mws/get-users-map')

gcsApi.use((req, _res, next) => {
  req.usersMap = new Map()
  next()
})
gcsApi.use(bodyParser.urlencoded({ extended: false }))
gcsApi.use(bodyParser.json())

gcsApi.post('/add-user', addUserRoute)
gcsApi.get('/add-user', getUsersMapRoute)

module.exports = gcsApi
