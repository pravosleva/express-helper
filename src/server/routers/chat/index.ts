/* eslint-disable import/extensions */
// const checkAuth from './mws/check-jwt')

import express from 'express'
import path from 'path'

const chatApi = express()

chatApi.use(
  '/',
  express.static(path.join(__dirname, './spa.build'))
)

export default chatApi
