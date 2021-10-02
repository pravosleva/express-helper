/* eslint-disable import/extensions */

import express from 'express'
import path from 'path'
import fs from 'fs'

const getUsersMapRoute = require('./mws/get-users-map').getUsersMap

// --- NOTE: Create storage file if necessary
const projectRootDir = path.join(__dirname, '../../../')
const CHAT_ROOMS_STATE_FILE_NAME = process.env.CHAT_ROOMS_STATE_FILE_NAME || 'chat.rooms.json'
const CHAT_PASSWORD_HASHES_MAP_FILE_NAME = process.env.CHAT_PASSWORD_HASHES_MAP_FILE_NAME || 'chat.passwd-hashes.json'
const CHAT_ROOMS_TASKLIST_MAP_FILE_NAME = process.env.CHAT_ROOMS_TASKLIST_MAP_FILE_NAME || 'chat.rooms-tasklist.json'

const storageRoomsFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_STATE_FILE_NAME)
const storageRegistryMapFilePath = path.join(projectRootDir, '/storage', CHAT_PASSWORD_HASHES_MAP_FILE_NAME)
const storageRoomsTasklistMapFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_TASKLIST_MAP_FILE_NAME)

const createFileIfNecessary = (storageUsersFilePath: string): void => {
  const ts = new Date().getTime()
  try {
    fs.appendFileSync(storageUsersFilePath, `{"data":{},"ts":${ts}}`, 'utf8')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    throw err
  }
}

try {
  [
    storageRoomsFilePath,
    storageRegistryMapFilePath,
    storageRoomsTasklistMapFilePath,
  ].forEach((storagePath: string) => {
    const isStorageFileExists = fs.existsSync(storagePath)

    if (!isStorageFileExists) createFileIfNecessary(storagePath)
  })
} catch (err) {
  // eslint-disable-next-line no-console
  console.log(err)
}
// ---

const chatApi = express()

chatApi.use(
  '/admin-ui',
  express.static(path.join(__dirname, './@socket.io/admin-ui/ui/dist'))
)
chatApi.use(
  '/admin-ui-prod',
  express.static(path.join(__dirname, './@socket.io/admin-ui/ui/dist-pravosleva'))
)
chatApi.use('/get-users-map', getUsersMapRoute)
chatApi.use(
  '/', express.static(path.join(__dirname, './spa.build'))
)
chatApi.use((req, _res, next) => {
  // @ts-ignore
  req.chatUsersStorageFilePath = storageUsersFilePath
  // @ts-ignore
  req.chatRoomsStorageFilePath = storageRoomsFilePath
  // @ts-ignore
  req.chatRegistryMapStorageFilePath = storageRegistryMapFilePath
  next()
})

export default chatApi
