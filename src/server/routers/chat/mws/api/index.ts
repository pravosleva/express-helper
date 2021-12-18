import express from 'express'
import bodyParser from 'body-parser'
import { createUser } from './create-user'
import { checkUser } from './check-user'

const jsonParser = bodyParser.json()

const chatExternalApi = express()

chatExternalApi.post('/create-user', jsonParser, createUser)
chatExternalApi.post('/check-user', jsonParser, checkUser)

export {
  chatExternalApi,
}
