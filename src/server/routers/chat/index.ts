/* eslint-disable import/extensions */

import express from 'express'
import path from 'path'
import fs from 'fs'
import { chatExternalApi } from './mws/api'
import bodyParser from 'body-parser'
import { redirectIfUnlogged } from './mws/api/auth/redirect-if-unlogged.middle' //  './auth/redirect-if-unlogged.middle'
// chatExternalApi.use(redirectIfUnlogged(jwtSecret, ELoggedCookie.JWT))
import { ELoggedCookie } from '~/routers/chat/utils/types'
import { redirectIfIncorrectParams } from './mws/api/auth/redirect-if-incorrect-params.middle'
import cookieParser from 'cookie-parser'
import { setUsernameToCookieOrDelete } from './mws/api/auth/set-username-to-cookie-or-delete'

const jwtSecret = 'tst'

const isDev = process.env.NODE_ENV === 'development'
const jsonParser = bodyParser.json()
const getUsersMapRoute = require('./mws/get-users-map').getUsersMap

// --- NOTE: Create storage file if necessary
const projectRootDir = path.join(__dirname, '../../../')
const CHAT_USERS_STATE_FILE_NAME = process.env.CHAT_USERS_STATE_FILE_NAME || 'chat.users.json'
const CHAT_ROOMS_STATE_FILE_NAME = process.env.CHAT_ROOMS_STATE_FILE_NAME || 'chat.rooms.json'
const CHAT_PASSWORD_HASHES_MAP_FILE_NAME = process.env.CHAT_PASSWORD_HASHES_MAP_FILE_NAME || 'chat.passwd-hashes.json'
const CHAT_ROOMS_TASKLIST_MAP_FILE_NAME = process.env.CHAT_ROOMS_TASKLIST_MAP_FILE_NAME || 'chat.rooms-tasklist.json'

const storageUsersFilePath = path.join(projectRootDir, '/storage', CHAT_USERS_STATE_FILE_NAME)
const storageRoomsFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_STATE_FILE_NAME)
const storageRegistryMapFilePath = path.join(projectRootDir, '/storage', CHAT_PASSWORD_HASHES_MAP_FILE_NAME)
const storageRoomsTasklistMapFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_TASKLIST_MAP_FILE_NAME)

const createFileIfNecessary = (storageUsersFilePath: string): void => {
  const isStorageFileExists = fs.existsSync(storageUsersFilePath)

  if (!isStorageFileExists) {
    const ts = new Date().getTime()
    try {
      fs.appendFileSync(storageUsersFilePath, `{"data":{},"ts":${ts}}`, 'utf8')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw err
    }
  }
}

try {
  [
    storageRoomsFilePath,
    storageRegistryMapFilePath,
    storageRoomsTasklistMapFilePath,
  ].forEach((storagePath: string) => {
    createFileIfNecessary(storagePath)
  })
} catch (err) {
  // eslint-disable-next-line no-console
  console.log(err)
}
// ---

const chatApi = express()

chatApi.use(cookieParser())

chatApi.use(
  '/admin-ui',
  express.static(path.join(__dirname, './@socket.io/admin-ui/ui/dist'))
)
chatApi.use(
  '/admin-ui-prod',
  express.static(path.join(__dirname, './@socket.io/admin-ui/ui/dist-pravosleva'))
)
chatApi.use('/api', jsonParser, chatExternalApi)
chatApi.use('/get-users-map', getUsersMapRoute)

chatApi.use('/storage', express.static(path.join(__dirname, '../../../storage')))

chatApi.use(
  '/',
  setUsernameToCookieOrDelete(jwtSecret, ELoggedCookie.JWT),
  // redirectIfUnlogged(jwtSecret, ELoggedCookie.JWT),
  // redirectIfIncorrectParams(jwtSecret, ELoggedCookie.JWT),
  express.static(path.join(__dirname, './spa.build')),
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
