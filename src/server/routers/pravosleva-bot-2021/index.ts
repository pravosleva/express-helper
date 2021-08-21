import express from 'express'
import { getFileShadowDocuments } from './mws/get-file-shadow-documents'
import { getFileShadowPhotos } from './mws/get-file-shadow-photos'

const botApi = express()
const bodyParser = require('body-parser')

botApi.use(bodyParser.urlencoded({ extended: false }))
botApi.use(bodyParser.json())

botApi.get('/get-file-shadow-documents/:file_name', getFileShadowDocuments)
botApi.get('/get-file-shadow-photos/:file_name', getFileShadowPhotos)

export const pravoslevaBot2021Router = botApi