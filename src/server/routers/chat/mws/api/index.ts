import express from 'express'
import bodyParser from 'body-parser'
import { createUser } from './create-user'
import { checkUser } from './check-user'
import { getUsers } from './get-users'
import { checkRoom } from './check-room'
import { removeUser } from './remove-user'
import { login } from './auth/login'
import { logout } from './auth/logout'
import { mutateReqIfLogged } from './auth/mutate-req-if-logged.middle'
import { checkJWT } from './auth/check-jwt'
import { ELoggedCookie } from '~/routers/chat/utils/types'
// import cookieParser from 'cookie-parser'
import { add as addNotif, checkRoomState as checkRoomNotifsState, remove as removeNotif } from './common-notifs'
import { getCPUState } from './get-cpu-state'
import { getBackupState } from './get-backup-state'

// import { redirectIfUnlogged } from './auth/redirect-if-unlogged.middle'
// chatExternalApi.use(redirectIfUnlogged(jwtSecret, ELoggedCookie.JWT))

const chatExternalApi = express()

// chatExternalApi.use(cookieParser())

const jwtSecret = 'tst'

chatExternalApi.use(bodyParser.urlencoded({ extended: true }))
chatExternalApi.use(bodyParser.json())

// chatExternalApi.use(mutateReqIfLogged(jwtSecret, ELoggedCookie.JWT))
chatExternalApi.post('/create-user', createUser)
chatExternalApi.post('/check-user', checkUser)
chatExternalApi.get('/get-users', getUsers)
chatExternalApi.post('/check-room', checkRoom)
chatExternalApi.get('/remove-user', removeUser)
chatExternalApi.post('/auth/login', login(jwtSecret, 2))
chatExternalApi.post('/auth/check-jwt', mutateReqIfLogged(jwtSecret, ELoggedCookie.JWT), checkJWT)
chatExternalApi.post('/auth/logout', logout(ELoggedCookie.JWT))
chatExternalApi.post(
  '/common-notifs/add',
  // checkJWT(jwtSecret, ELoggedCookie.JWT),
  addNotif
)
chatExternalApi.post(
  '/common-notifs/check-room-state',
  // checkJWT(jwtSecret, ELoggedCookie.JWT),
  checkRoomNotifsState
)
chatExternalApi.post(
  '/common-notifs/remove',
  // checkJWT(jwtSecret, ELoggedCookie.JWT),
  removeNotif
)
chatExternalApi.get('/get-cpu-state', getCPUState)
chatExternalApi.get('/get-backup-state', getBackupState)

export {
  chatExternalApi,
}
