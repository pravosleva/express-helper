/* eslint-disable import/extensions */
import fs from 'fs'
import path from 'path'
import { gcsUsersMapInstance } from '../../utils/gcsUsersMapInstance'
// import { writeStaticJSONAsync, getStaticJSONSync } from '../../utils/fs-tools'

const express = require('express')

const gcsApi = express()
const bodyParser = require('body-parser')
const addUserRoute = require('./mws/add-user').addUser
const getUsersMapRoute = require('./mws/get-users-map').getUsersMap

// --- NOTE: Create storage file if necessary
const projectRootDir = path.join(__dirname, '../../../')
const GCS_USERS_FILE_NAME = process.env.GCS_USERS_FILE_NAME || 'gcs-users.json'
const storageFilePath = path.join(projectRootDir, '/storage', GCS_USERS_FILE_NAME)

try {
  const isStorageFileExists = fs.existsSync(storageFilePath)
  if (!isStorageFileExists) {
    try {
      fs.appendFileSync(storageFilePath, '{}', 'utf8')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw err
    }
    // console.log(fs.existsSync(storageFilePath))
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.log(err)
}
// ---

gcsApi.use((req, _res, next) => {
  req.gcsUsersMapInstance = gcsUsersMapInstance
  req.gcsStorageFilePath = storageFilePath
  next()
})
gcsApi.use(bodyParser.urlencoded({ extended: false }))
gcsApi.use(bodyParser.json())

gcsApi.post('/add-user', addUserRoute)
gcsApi.use('/get-users-map', getUsersMapRoute)

module.exports = gcsApi
