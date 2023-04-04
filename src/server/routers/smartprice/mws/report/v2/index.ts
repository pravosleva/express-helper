import express from 'express'
import { sendReport as sendSsrRdErrorGoogleSheetsReport } from './ssr/rd-errs/send'
import {
  sendReport as sendOfflineTradeInUploadPhotoGoogleSheetsReport,
  spNotifyMW as spOfflineTradeInTelegramNotifyMW,
} from './offline-tradein/upload-wizard/send'
import {
  getAnalysis as sendOfflineTradeInGetAnalysis,
} from './offline-tradein/upload-wizard/get-timing-analysis'
import {
  sendReport as sendOfflineTradeInMainGoogleSheetsReport,
  spRetranslateToUploadWizardMW as spOfflineTradeInRetranslateToUploadWizardMW,
} from './offline-tradein/main/send'
import { getRandom as getRandomIMEI } from './imei/usable/get-random'
import { markAsUsed as markIMEIAsUsed } from './imei/usable/mark-as-used'
import { sendBoughtDevice } from './imei/bought-device/send'
import { google } from 'googleapis'
import { runTGExtraNotifs as runTGExtraNotifs } from './run-tg-extra-notifs'

import fs from 'fs'
import path from 'path'

const projectRootDir = path.join(__dirname, '../../../../../../')
if (!fs.existsSync(path.join(projectRootDir, 'server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json'))) {
  throw new Error(
    `⛔ The file\n"server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json" can't be found. Put it to:\n"src/server/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json" before build`
  )
}

const router = express.Router()

const spGoogleSheetsAuth = (req, res, next) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  })
  const spreadsheetId = '1NBXuyGlCznS0SJjJJX52vR3ZzqPAPM8LQPM_GX8T_Wc'

  req.smartprice = {
    googleSheetsAuth: auth,
    spreadsheetId,
  }
  next()
}

router.use(spGoogleSheetsAuth)

// TG notifs service
router.post('/run-tg-extra-notifs', runTGExtraNotifs)

// SSR
router.post('/gapi-rd-errors/send', sendSsrRdErrorGoogleSheetsReport) // Deprecated
router.post('/ssr/rd-errs/send', sendSsrRdErrorGoogleSheetsReport)

// OFFLINE TRADE-IN
router.post(
  '/offline-tradein/upload-wizard/send',
  sendOfflineTradeInUploadPhotoGoogleSheetsReport,
  spOfflineTradeInTelegramNotifyMW,
)
router.post(
  '/offline-tradein/upload-wizard/get-timing-analysis',
  sendOfflineTradeInGetAnalysis,
)
router.post(
  '/offline-tradein/main/send',
  sendOfflineTradeInMainGoogleSheetsReport,
  spOfflineTradeInRetranslateToUploadWizardMW,
)

// IMEI SERVICE
router.post('/imei/usable/get-random', getRandomIMEI)
router.post('/imei/usable/mark-as-used', markIMEIAsUsed)
router.post('/imei/bought-device/send', sendBoughtDevice)

export const reportV2 = router
