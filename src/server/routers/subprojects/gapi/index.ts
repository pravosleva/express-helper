import express from 'express'
import { getItems } from './viselitsa-2023/get-items'
import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'

const jsonParser = bodyParser.json()

const projectRootDir = path.join(__dirname, '../../../../')
if (!fs.existsSync(path.join(projectRootDir, 'server-dist/routers/subprojects/gapi/credentials_console.cloud.google.com.json'))) {
  throw new Error(
    `⛔ The file\n"server-dist/routers/subprojects/gapi/credentials_console.cloud.google.com.json" can't be found. Put it to:\n"src/server/routers/subprojects/gapi/credentials_console.cloud.google.com.json" before build`
  )
}

const router = express.Router()

router.post('/viselitsa-2023/get-items', jsonParser, getItems)

export const gapiRouter = router
