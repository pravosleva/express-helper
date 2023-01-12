import express from 'express'
import { sendReport as sendSSRRDError } from './ssr/rd-errs/send'
import { sendReport as sendOfflineTradeInUploadPhotoReport } from './offline-tradein/upload-wizard/send'

import fs from 'fs'
import path from 'path'

const projectRootDir = path.join(__dirname, '../../../../../../')
if (!fs.existsSync(path.join(projectRootDir, 'server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json'))) {
  throw new Error(
    `⛔ The file\n"server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json" can't be found. Put it to:\n"src/server/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json" before build`
  )
}

const router = express.Router()

// SSR
router.post('/gapi-rd-errors/send', sendSSRRDError)
router.post('/ssr/rd-errs/send', sendSSRRDError)

// OFFLINE TRADE-IN
router.post('/offline-tradein/upload-wizard/send', sendOfflineTradeInUploadPhotoReport)

export const reportV2 = router
