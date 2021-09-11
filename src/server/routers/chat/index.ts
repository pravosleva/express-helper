/* eslint-disable import/extensions */
// const checkAuth from './mws/check-jwt')

import express from 'express'
import path from 'path'

const chatApi = express()

chatApi.use(
  '/admin-ui',
  express.static(path.join(__dirname, './@socket.io/admin-ui/ui/dist'))
)
chatApi.use(
  '/admin-ui-pravosleva',
  express.static(path.join(__dirname, './@socket.io/admin-ui/ui/dist-pravosleva'))
)
// chatApi.use(
//   '/admin-ui',
//   (_req, res, next) => {
//     res.json({ ok: true })
//     next()
//   }
// )
chatApi.use(
  '/', express.static(path.join(__dirname, './spa.build'))
)

export default chatApi
