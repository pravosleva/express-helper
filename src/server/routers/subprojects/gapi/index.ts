import express from 'express'
import { getItems } from './viselitsa-2023/get-items'
import { getDict } from './audit-helper-2023/get-dict-1'
import { getDict2 } from './audit-helper-2023/get-dict-2'
import { mainReport } from './audit-helper-2023/main-report'
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
router.post('/audit-helper-2023/get-dict-1', jsonParser, getDict)
router.post('/audit-helper-2023/get-dict-2', jsonParser, getDict2)
router.post('/audit-helper-2023/main-report', jsonParser, mainReport)

export const gapiRouter = router
