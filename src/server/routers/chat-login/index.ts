/* eslint-disable import/extensions */
import express from 'express'
import path from 'path'
// import bodyParser from 'body-parser'
import { redirectIfUnlogged } from '../chat/mws/api/auth/redirect-if-unlogged.middle'
import { ELoggedCookie } from '~/routers/chat/utils/types'

const jwtSecret = 'tst'

const chatLogin = express()

chatLogin.use(
  '/',
  // redirectIfLogged(jwtSecret, ELoggedCookie.JWT),
  express.static(path.join(__dirname, './spa.build')),
)

export default chatLogin
