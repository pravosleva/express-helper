import express from 'express'
import { google } from 'googleapis'
import { withReqParamsValidationMW } from '~/utils/express-validation/withReqParamsValidationMW'
import fs from 'fs'
import path from 'path'
import {
  rules as feedbackRules,
  feedback as blogFeedback,
} from './mws/gapi/blog/feedback'
import { getSinglePersonInfo, rules as singlePersonInfoRues } from './mws/gapi/family-tree-2023/v1/get-single-person-info'

const projectRootDir = path.join(__dirname, '../../../')

type TCredentialsItem = {
  distPath: string;
  srcPath: string;
  getErrMsg: (_ps: {
    distPath: string;
    srcPath: string;
  }) => string;
}
const consoleCloudGoogleCredentialFiles: {[key: string]: TCredentialsItem} = {
  pravoslevaBlog2023: {
    distPath: 'server-dist/routers/pravosleva-blog-2023/mws/gapi/credentials_console.cloud.google.com.json',
    srcPath: 'src/server/routers/pravosleva-blog-2023/mws/gapi/credentials_console.cloud.google.com.json',
    getErrMsg: (file: { distPath: string; srcPath: string }) => `⛔ The file\n"${file.distPath}" can't be found. Put it to:\n"${file.srcPath}" before build / projectRootDir is "${projectRootDir}"`,
  },
}
for (const key in consoleCloudGoogleCredentialFiles) {
  const file = consoleCloudGoogleCredentialFiles[key]
  if (!fs.existsSync(path.join(projectRootDir, file.distPath))) {
    throw new Error(file.getErrMsg(file))
  }
}

const router = express.Router()

const blog2023GoogleSheetsAuth = (req, _res, next) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: consoleCloudGoogleCredentialFiles.pravoslevaBlog2023.distPath,
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  })
  req.pravoslevaBlog2023 = {
    googleSheetsAuth: auth,
  }
  next()
}
router.use(blog2023GoogleSheetsAuth)

// Subroutes:
router.post(
  '/blog/feedback',
  withReqParamsValidationMW({
    rules: feedbackRules,
  }),
  blogFeedback,
)
router.post(
  '/family-tree-2023/v1/get-single-person-info',
  withReqParamsValidationMW({
    rules: singlePersonInfoRues,
  }),
  getSinglePersonInfo,
)

export const pravoslevaBlod2023Api = router
