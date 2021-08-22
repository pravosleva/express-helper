import express from 'express'
import { getFileShadowDocuments } from './mws/get-file-shadow-documents'
import { getFileShadowPhotos } from './mws/get-file-shadow-photos'
import { addEntryRoute } from './mws/add-entry'
import { getEntriesMapRoute } from './mws/get-entries-map'
import path from 'path'
import fs from 'fs'

const botApi = express()
const bodyParser = require('body-parser')

// --- NOTE: Create storage file if necessary
const projectRootDir = path.join(__dirname, '../../../')
const STORAGE_FILE_NAME = process.env.PRAVOSLEVA_BOT_2021_STORAGE_FILE_NAME || 'pravosleva-bot-2021.json'
const storageFilePath = path.join(projectRootDir, '/storage', STORAGE_FILE_NAME)
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
// ---

botApi.use((req, _res, next) => {
  // @ts-ignore
  req.botStorageFilePath = storageFilePath
  next()
})

botApi.use(bodyParser.urlencoded({ extended: false }))
botApi.use(bodyParser.json())

botApi.get('/get-file-shadow-documents/:file_name', getFileShadowDocuments)
botApi.get('/get-file-shadow-photos/:file_name', getFileShadowPhotos)
botApi.post('/add-entry', addEntryRoute)
botApi.get('/get-entries-map', getEntriesMapRoute)

export const pravoslevaBot2021Router = botApi