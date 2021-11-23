/* eslint-disable import/extensions */
// NOTE: envs already got from ./server-dist/.env

import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import siofu from 'socketio-file-upload'
import authRouter from './routers/auth'
import chatRouter from './routers/chat'

import { EAccessCode, redirect } from './routers/auth/cfg'
import redirectIfUnloggedMw from './routers/auth/mws/redirect-if-unlogged'
import mainRouter from './routers/index'
import usersRouter from './routers/users'
import urlMetadataRouter from './routers/url-metadata'
import reCAPTCHAV3Router from './routers/recaptcha-v3'
import mainSwaggerRouter from './routers/swagger'
import smartpriceRouter from './routers/smartprice'
import imeiRouter from './routers/imei'
import gcsApi from './routers/gcs'
import { qrApi as qrRouter } from './routers/qr'
import { addsDevicesLoggedStateInstance } from './utils/addsDevicesLoggedStateInstance'
import { pravoslevaBot2021Router } from './routers/pravosleva-bot-2021'
import { systemRouter } from './routers/system'

const app = express()

const addRequestId = require('express-request-id')()

app.use(cors())
app.use(addRequestId) // NOTE: New additional field req.id
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use((req, _res, next) => {
  req.loggedMap = addsDevicesLoggedStateInstance
  next()
})
// -- Uploader init (part 1/2)
app.use(siofu.router)
// --

// NOTE: Пути до "публичной" статики (та что в ./public/*) указываем относительно <PROJECT_ROOT_DIR>/server-dist
// (transpiling destination dir) ...или ./bin/www, откуда будет запуск?
app.get(
  '/',
  redirectIfUnloggedMw(redirect[EAccessCode.Homepage].jwtSecret, EAccessCode.Homepage),
  express.static(path.join(__dirname, '../', 'public')),
  mainRouter
)
app.use(express.static(path.join(__dirname, '../', 'public')))

app.use('/users', usersRouter)
app.use('/url-metadata', urlMetadataRouter)
app.use('/recaptcha-v3', reCAPTCHAV3Router)
app.use('/swagger', mainSwaggerRouter)
app.use('/smartprice', smartpriceRouter)
app.use('/imei', imeiRouter)
app.use('/gcs', gcsApi)
app.use('/auth', authRouter)
app.use('/qr', qrRouter)
app.use('/pravosleva-bot-2021', pravoslevaBot2021Router)
app.use('/system', systemRouter)
app.use('/chat', chatRouter)

module.exports = app
