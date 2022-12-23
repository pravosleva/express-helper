import express from 'express'
import { sendRDError } from './gapi-rd-errors/send'
import fs from 'fs'
import path from 'path'

const projectRootDir = path.join(__dirname, '../../../../../../')
if (!fs.existsSync(path.join(projectRootDir, 'server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json'))) {
  throw new Error(
    `⛔ The file\n"server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json" can't be found. Put it to:\n"src/server/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json" before build`
  )
}

const router = express.Router()

router.post('/gapi-rd-errors/send', sendRDError)

export const reportV2 = router
