import express from 'express'
import bodyParser from 'body-parser'
import { createUser } from './create-user'
import { checkUser } from './check-user'
import { getUsers } from './get-users'
import { checkRoom } from './check-room'
import { removeUser } from './remove-user'
import { login } from './auth/login'

// import { redirectIfLogged } from './auth/redirect-if-logged.middle'
// import { ELoggedCookie } from '~/routers/chat/utils/types'
// redirectIfLogged(jwtSecret, ELoggedCookie.JWT)
// const jwtSecret = 'tst'

// import { redirectIfUnlogged } from './auth/redirect-if-unlogged.middle'
// chatExternalApi.use(redirectIfUnlogged(jwtSecret, ELoggedCookie.JWT))

const chatExternalApi = express()

const jwtSecret = 'tst'

chatExternalApi.use(bodyParser.urlencoded({ extended: true }))
chatExternalApi.use(bodyParser.json())


chatExternalApi.post('/create-user', createUser)
chatExternalApi.post('/check-user', checkUser)
chatExternalApi.get('/get-users', getUsers)
chatExternalApi.post('/check-room', checkRoom)
chatExternalApi.get('/remove-user', removeUser)
chatExternalApi.post('/auth/login', login(jwtSecret, 2))

export {
  chatExternalApi,
}
