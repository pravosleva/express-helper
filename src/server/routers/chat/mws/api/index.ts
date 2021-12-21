import express from 'express'
import bodyParser from 'body-parser'
import { createUser } from './create-user'
import { checkUser } from './check-user'
import { getUsers } from './get-users'

const jsonParser = bodyParser.json()

const chatExternalApi = express()

chatExternalApi.post('/create-user', jsonParser, createUser)
chatExternalApi.post('/check-user', jsonParser, checkUser)
chatExternalApi.get('/get-users', jsonParser, getUsers)

export {
  chatExternalApi,
}
