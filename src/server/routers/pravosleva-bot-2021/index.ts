import express from 'express'
import { getFileUrl } from './mws/get-file-url'

const botApi = express()
const bodyParser = require('body-parser')

botApi.use(bodyParser.urlencoded({ extended: false }))
botApi.use(bodyParser.json())

botApi.get('/get-file-url/:file_name', getFileUrl)

export const pravoslevaBot2021Router = botApi