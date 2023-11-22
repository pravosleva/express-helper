import express from 'express'
import { getItems } from './viselitsa-2023/get-items'
import { getDict } from './audit-helper-2023/get-dict-1'
import { getDict2 } from './audit-helper-2023/get-dict-2'
import { mainReport } from './audit-helper-2023/main-report'
import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'
import { getLinksForParser } from './audit-helper-2023/get-links-for-parser'
import { sendNotifyMW as sendAuditHelper2023Notify } from './audit-helper-2023/notify/send'
import { sendNotify2MW as sendAuditHelper2023NotifyV2 } from './audit-helper-2023/notify/send-2'
import { getJobs } from './audit-list/jobs'

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
router.post('/audit-helper-2023/get-links-for-parser', jsonParser, getLinksForParser)
router.post('/audit-helper-2023/notify/send', jsonParser, sendAuditHelper2023Notify)
router.post('/audit-helper-2023/notify/send-2', jsonParser, sendAuditHelper2023NotifyV2)

router.post('/todo-2023/jobs', jsonParser, getJobs) // NOTE: Deprecated
router.post('/audit-list/jobs', jsonParser, getJobs)

export const gapiRouter = router
