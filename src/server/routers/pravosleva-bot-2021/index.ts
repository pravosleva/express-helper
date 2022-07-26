import express from 'express'
import { addEntryRoute } from './mws/add-entry'
import { getEntriesMapRoute } from './mws/get-entries-map'
import path from 'path'
import { createFileIfNecessary } from '~/utils/fs-tools/createFileIfNecessary'
import { addAutoparkUser } from './mws/autopark-2022/add-user'
import { getAutoparkUsersMap } from './mws/autopark-2022/get-users-map'
import { checkAutoparkUser } from './mws/autopark-2022/check-user'
import { checkAutoparkUserPassword } from './mws/autopark-2022/check-password'
import { createAutoparkProject } from './mws/autopark-2022/project/create'
import { createAutoparkProjectItem } from './mws/autopark-2022/project/add-item'
import { getAutoparkProject } from './mws/autopark-2022/project/get-data'
import { updateAutoparkProject } from './mws/autopark-2022/project/update'
import { removeAutoparkProjectItem } from './mws/autopark-2022/project/remove-item'
import { removeAutoparkProject } from './mws/autopark-2022/project/remove'
import { getUserProjects } from './mws/autopark-2022/get-user-projects'
import { getProjectReport } from './mws/autopark-2022/project/get-report'
import { updateAutoparkProjectItem } from './mws/autopark-2022/project/update-item'

const botApi = express()
const bodyParser = require('body-parser')

// --- NOTE: Create storage files if necessary
const projectRootDir = path.join(__dirname, '../../../')

const STORAGE_FILE_NAME = process.env.PRAVOSLEVA_BOT_2021_STORAGE_FILE_NAME || 'pravosleva-bot-2021.json'
const storageFilePath = path.join(projectRootDir, '/storage', STORAGE_FILE_NAME)

const AUTOPARK_2022_STORAGE_FILE_NAME = process.env.PRAVOSLEVA_BOT_2021_AUTOPARK_2022_STORAGE_FILE_NAME || 'pravosleva-bot-2021.autopark-2022.json'
const autopark2022StorageFilePath = path.join(projectRootDir, '/storage', AUTOPARK_2022_STORAGE_FILE_NAME)

createFileIfNecessary(storageFilePath, '{}')
createFileIfNecessary(autopark2022StorageFilePath, '{}')
// ---

botApi.use((req, _res, next) => {
  // @ts-ignore
  req.botStorageFilePath = storageFilePath
  // @ts-ignore
  req.autopark2022StorageFilePath = autopark2022StorageFilePath
  next()
})

botApi.use(bodyParser.urlencoded({ extended: false }))
botApi.use(bodyParser.json())

botApi.post('/add-entry', addEntryRoute)
botApi.get('/get-entries-map', getEntriesMapRoute)

botApi.post('/autopark-2022/add-user', addAutoparkUser)
botApi.get('/autopark-2022/get-users-map', getAutoparkUsersMap)
botApi.post('/autopark-2022/check-user', checkAutoparkUser)
botApi.post('/autopark-2022/check-password', checkAutoparkUserPassword)
botApi.post('/autopark-2022/project/create', createAutoparkProject)
botApi.post('/autopark-2022/project/add-item', createAutoparkProjectItem)
botApi.post('/autopark-2022/project/get-data', getAutoparkProject)
botApi.post('/autopark-2022/project/update', updateAutoparkProject)
botApi.post('/autopark-2022/project/remove-item', removeAutoparkProjectItem)
botApi.post('/autopark-2022/project/remove', removeAutoparkProject)
botApi.post('/autopark-2022/get-user-projects', getUserProjects)
botApi.post('/autopark-2022/project/get-report', getProjectReport)
botApi.post('/autopark-2022/project/update-item', updateAutoparkProjectItem)

export const pravoslevaBot2021Router = botApi
