import express from 'express'
import { getFileShadow } from './mws/get-file-shadow'

const botApi = express()
const bodyParser = require('body-parser')

botApi.use(bodyParser.urlencoded({ extended: false }))
botApi.use(bodyParser.json())

botApi.get('/get-file-shadow/:file_name', getFileShadow)

export const pravoslevaBot2021Router = botApi