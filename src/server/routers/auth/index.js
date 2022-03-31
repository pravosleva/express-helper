/* eslint-disable import/extensions */
// const checkAuth from './mws/check-jwt')

import express from 'express'
import path from 'path'
import { goTarget } from './mws/go-target'
import loginRoute from './mws/login'
import redirectIfLoggedMw from './mws/redirect-if-logged'
import { accessCode, redirect } from './cfg'
import getAccessCodeByHash from './mws/get-access-code-by-hash'

const authApi = express()

const { EXPIRES_COOKIES_IN_DAYS } = process.env

let expiresCookiesTimeInDays
try {
  // eslint-disable-next-line radix
  expiresCookiesTimeInDays = parseInt(EXPIRES_COOKIES_IN_DAYS)
} catch (err) {
  expiresCookiesTimeInDays = 1
}

authApi.post('/login', loginRoute(expiresCookiesTimeInDays))
authApi.use(
  '/signin',
  redirectIfLoggedMw(redirect[accessCode.OTSvyaznoyV1].jwtSecret, accessCode.OTSvyaznoyV1),
  redirectIfLoggedMw(redirect[accessCode.Homepage].jwtSecret, accessCode.Homepage),
  // TODO: Other middlewares...
  express.static(path.join(__dirname, './pages/signin/build'))
)
authApi.get('/get-access-code-by-hash', getAccessCodeByHash)
authApi.get('/go-target', goTarget(expiresCookiesTimeInDays))

export default authApi
