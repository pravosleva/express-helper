import express from 'express'
import {
  rules as ssrRdErrorGoogleSheetsReportRules,
  // sendReport as sendSsrRdErrorGoogleSheetsReport,
} from './ssr/rd-errs/send'
import {
  sendReport as sendOfflineTradeInUploadPhotoGoogleSheetsReport,
  rules as uploadWizardReportRules,
  spNotifyMW as offlineTradeInTelegramNotifyMW,
} from './offline-tradein/upload-wizard/send'
import {
  sendReport as sendOfflineTradeInMtsmain2024GoogleSheetsReport,
  rules as offlineTradeInMtsmain2024ReportRules,
  spNotifyMW as offlineTradeInMtsmain2024TelegramNotifyMW,
} from './offline-tradein/mtsmain2024/send'
import {
  getAnalysis as sendOfflineTradeInGetAnalysis,
  rules as getTimingAnalysisRules,
} from './offline-tradein/upload-wizard/get-timing-analysis'
import {
  sendReport as sendOfflineTradeInMainGoogleSheetsReport,
  spRetranslateToUploadWizardMW as offlineTradeInRetranslateToUploadWizardMW,
} from './offline-tradein/main/send'
import { getRandom as getRandomIMEI } from './imei/usable/get-random'
import { markAsUsed as markIMEIAsUsed } from './imei/usable/mark-as-used'
import { sendBoughtDevice } from './imei/bought-device/send'
import { google } from 'googleapis'
import { runTGExtraNotifs as runTGExtraNotifs } from './run-tg-extra-notifs'
import {
  sendReport as sendCRMGoogleSheetsReport,
  rules as crmMainReportRules,
} from './crm/main/send'
import { withReqParamsValidationMW } from '~/utils/express-validation/withReqParamsValidationMW'

import fs from 'fs'
import path from 'path'
import { partnerSettings } from '~/routers/smartprice/utils/offline-tradein/partnerSettings'
import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'

const projectRootDir = path.join(__dirname, '../../../../../../')
type TCredentialsItem = {
  distPath: string;
  srcPath: string;
  getErrMsg: (_ps: {
    distPath: string;
    srcPath: string;
  }) => string;
}
const consoleCloudGoogleCredentialFiles: {[key: string]: TCredentialsItem} = {
  smartprice: {
    distPath: 'server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json',
    srcPath: 'src/server/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json',
    getErrMsg: (file: { distPath: string; srcPath: string }) => `⛔ The file\n"${file.distPath}" can't be found. Put it to:\n"${file.srcPath}" before build`,
  },
}
for (const key in consoleCloudGoogleCredentialFiles) {
  const file = consoleCloudGoogleCredentialFiles[key]
  if (!fs.existsSync(path.join(projectRootDir, file.distPath))) {
    throw new Error(file.getErrMsg(file))
  }
}

const router = express.Router()

const spGoogleSheetsAuth = (req, _res, next) => {
  const auth: GoogleAuth<JSONClient> = new google.auth.GoogleAuth({
    keyFile: consoleCloudGoogleCredentialFiles.smartprice.distPath,
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

// -- NOTE: Offline Trade-In partner Django template settings analysis
const spOfflineTradeInPartnerSettingsAnalysis = (req, res, next) => {
  if (!!req.body) {
    const { _partnerSettingsDebug } = req.body

    if (!!_partnerSettingsDebug) {
      req.smartprice.partnerSettingsAnalysis = partnerSettings.getAnalysis({
        namespace: _partnerSettingsDebug.namespace,
        testedSettings: _partnerSettingsDebug.testedSettings,
      })
    }
  }
  next()
}
router.use(spOfflineTradeInPartnerSettingsAnalysis)
// --

// TG notifs service
router.post('/run-tg-extra-notifs', runTGExtraNotifs)

// SSR
// router.post('/gapi-rd-errors/send', sendSsrRdErrorGoogleSheetsReport) // NOTE: Deprecated
router.post(
  '/ssr/rd-errs/send',
  withReqParamsValidationMW({
    rules: ssrRdErrorGoogleSheetsReportRules,
  }),
  // sendSsrRdErrorGoogleSheetsReport,
  (_req, res) => {
    res.status(200).send({ ok: false, message: 'Not supported' })
  },
)

// OFFLINE TRADE-IN
router.post(
  '/offline-tradein/upload-wizard/send',
  withReqParamsValidationMW({
    rules: uploadWizardReportRules,
  }),
  sendOfflineTradeInUploadPhotoGoogleSheetsReport,
  offlineTradeInTelegramNotifyMW,
)
router.post(
  '/offline-tradein/upload-wizard/get-timing-analysis',
  withReqParamsValidationMW({
    rules: getTimingAnalysisRules,
  }),
  sendOfflineTradeInGetAnalysis,
)
router.post(
  '/offline-tradein/main/send',
  sendOfflineTradeInMainGoogleSheetsReport,
  offlineTradeInRetranslateToUploadWizardMW,
)
router.post(
  '/offline-tradein/mtsmain2024/send',
  withReqParamsValidationMW({
    rules: offlineTradeInMtsmain2024ReportRules,
  }),
  sendOfflineTradeInMtsmain2024GoogleSheetsReport,
  offlineTradeInMtsmain2024TelegramNotifyMW,
)

// CRM
router.post('/crm/main/send', withReqParamsValidationMW({
  rules: crmMainReportRules
}), sendCRMGoogleSheetsReport)

// IMEI SERVICE
router.post('/imei/usable/get-random', getRandomIMEI)
router.post('/imei/usable/mark-as-used', markIMEIAsUsed)
router.post('/imei/bought-device/send', sendBoughtDevice)

export const reportV2 = router
