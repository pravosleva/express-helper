import express, { Express as IExpress } from 'express'
import { tstGenerate } from './mws/tst.generate'
import { tryAuthOnOtherDevice } from './mws/tst.try-auth-on-other-device'
import { getLoggedMap } from './mws/get-logged-map'
import { generate } from './mws/generate'
import { clearState } from './mws/reset-logged-map'
import { swagger } from './mws/swagger'
import { getQRByLoggedReqId } from './mws/get-qr-by-logged-req-id'

import { EAccessCode, redirect } from '../auth/cfg'
import redirectIfUnloggedMw from '../auth/mws/redirect-if-unlogged'

const qrApi: IExpress = express()

qrApi.get('/tst.generate', tstGenerate)
qrApi.get('/tst.try-auth-on-other-device', tryAuthOnOtherDevice)

qrApi.get('/get-logged-map', getLoggedMap)
qrApi.post('/generate', generate)
qrApi.get('/reset-logged-map', clearState)
qrApi.use(
  '/swagger',
  redirectIfUnloggedMw(redirect[EAccessCode.QRSwagger].jwtSecret, EAccessCode.QRSwagger),
  swagger,
)
qrApi.get('/get-qr-by-logged-req-id', getQRByLoggedReqId)

export { qrApi }
