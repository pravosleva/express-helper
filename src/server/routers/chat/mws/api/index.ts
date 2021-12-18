import express from 'express'
import bodyParser from 'body-parser'
import { createUser } from './create-user'

const jsonParser = bodyParser.json()

const chatExternalApi = express()

chatExternalApi.post('/create-user', jsonParser, createUser)

export {
  chatExternalApi,
}
