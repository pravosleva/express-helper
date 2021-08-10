const express = require('express')

const gcsApi = express()
const bodyParser = require('body-parser')
const addUserRoute = require('./mws/add-user').addUser
const getUsersMapRoute = require('./mws/get-users-map').getUsersMap

gcsApi.use((req, _res, next) => {
  req.usersMap = new Map()
  next()
})
gcsApi.use(bodyParser.urlencoded({ extended: false }))
gcsApi.use(bodyParser.json())

gcsApi.post('/add-user', addUserRoute)
gcsApi.use('/get-users-map', getUsersMapRoute)

module.exports = gcsApi
