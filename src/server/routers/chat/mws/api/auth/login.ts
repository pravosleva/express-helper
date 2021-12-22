import { Request as IRequest, Response as IResponse } from 'express'
// import buildUrl from 'build-url'
import { getMsByDays } from '~/utils/auth/getMsByDays'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { registeredUsersMapInstance as usersMap } from '~/utils/socket/state/registeredUsersMapInstance'
import { EAPILoginCode, ELoggedCookie } from '~/routers/chat/utils/types'
import QRCode from 'qrcode'
import { promisify } from 'es6-promisify'

const genDataUrl: (payload: string) => Promise<string> = promisify(QRCode.toDataURL.bind(QRCode))

const getRoomLink = (room: string) => `http://pravosleva.ru/express-helper/chat/#/?room=${room}`

export const login = (jwtSecret: string, expiresCookiesTimeInDays: number) => async (req: IRequest, res: IResponse) => {
  const requiredParams = ['login', 'password', 'tg_chat_id', 'room']
  const errs = []
  for (const key of requiredParams) if (!req.body[key]) errs.push(key)
  if (errs.length > 0) return res
    .status(400)
    .json({ message: `Неверные параметры запроса: ${errs.join(', ')}`, code: EAPILoginCode.IncorrectParams })

  const userData = usersMap.get(String(req.body.chat_id))
  if (!userData) return res
    .status(404)
    .json({ message: 'Пользователь не найден', code: EAPILoginCode.NotFound })
  
  const passwordHash = userData.passwordHash
  if (!passwordHash) return res
    .status(404)
    .json({ message: 'Server ERR: Хэш не найден, попробуйте восстановить пароль', code: EAPILoginCode.ServerError })
  
  // 1. Compare hash
  const testedHash = bcrypt.hashSync(req.body.password)
  if (testedHash !== passwordHash) return res
    .status(200)
    .json({ message: 'Неверный пароль', code: EAPILoginCode.IncorrectPassword })

  // 2. Password correct -> set jwt to cookie
  const jwt4Cookie = jwt.sign({ room: req.body.room, user: req.body.login, tg_chat_id: req.body.tg_chat_id }, jwtSecret, {
    expiresIn: 60 * 60 * 24 * expiresCookiesTimeInDays,
  })
  const maxAge = getMsByDays(expiresCookiesTimeInDays)

  res.cookie(ELoggedCookie.JWT, jwt4Cookie, { maxAge, httpOnly: true })

  // 3. QR
  const qrPayload = getRoomLink(req.body.room)
  const dataUrl: string = await genDataUrl(qrPayload)

  res
    .status(200)
    .json({ message: `Logges as ${req.body.login}; cookie ${ELoggedCookie.JWT} was set`, code: EAPILoginCode.Logged, QRDataUrl: dataUrl })
}
