import { Request as IRequest, Response as IResponse } from 'express'
// import buildUrl from 'build-url'
import { getMsByDays } from '~/utils/auth/getMsByDays'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { registeredUsersMapInstance as usersMap } from '~/utils/socket/state/registeredUsersMapInstance'
import { EAPILoginCode, ELoggedCookie } from '~/routers/chat/utils/types'
import QRCode from 'qrcode'
import { promisify } from 'es6-promisify'

const EXTERNAL_ROUTING = process.env.EXTERNAL_ROUTING || ''

const genDataUrl: (payload: string) => Promise<string> = promisify(QRCode.toDataURL.bind(QRCode))
const getRoomLink = (room: string) => `${EXTERNAL_ROUTING}/chat/#/?room=${room}`

export const login = (jwtSecret: string, expiresCookiesTimeInDays: number) => async (req: IRequest, res: IResponse) => {
  const requiredParams = ['username', 'password', 'room']
  const errs = []
  for (const key of requiredParams) if (!req.body[key]) errs.push(key)
  if (errs.length > 0) return res
    .status(400)
    .json({ ok: false, message: `Неверные параметры запроса: ${errs.join(', ')}`, code: EAPILoginCode.IncorrectParams })

  const userData = usersMap.get(String(req.body.username))
  if (!userData) return res
    .status(404)
    .json({ ok: false, message: 'Пользователь не найден', code: EAPILoginCode.NotFound })
  
  const passwordHash = userData.passwordHash
  // console.log('eq.body.password)', req.body.password)
  // console.log(req.body)
  const tgChatId = userData.tg?.chat_id
  if (!tgChatId) return res
    .status(404)
    .json({ ok: false, message: 'Пользователь не найден, попробуйте восстановить пароль через бота', code: EAPILoginCode.ServerError })

  if (!passwordHash) return res
    .status(404)
    .json({ ok: false, message: 'Server ERR: Хэш не найден, попробуйте восстановить пароль', code: EAPILoginCode.ServerError })
  
  // 1. Compare hash
  if (!bcrypt.compareSync(req.body.password, passwordHash)) return res
    .status(200)
    .json({ ok: false, message: 'Неверный пароль', code: EAPILoginCode.IncorrectPassword })

  // 2. Password correct -> set jwt to cookie
  const jwt4Cookie = jwt.sign({ username: req.body.username, tgChatId }, jwtSecret, {
    expiresIn: 60 * 60 * 24 * expiresCookiesTimeInDays,
  })
  const maxAge = getMsByDays(expiresCookiesTimeInDays)

  res.cookie(ELoggedCookie.JWT, jwt4Cookie, { maxAge, httpOnly: true })

  // 3. QR
  const qrPayload = getRoomLink(req.body.room)
  const dataUrl: string = await genDataUrl(qrPayload)

  res
    .status(200)
    .json({ ok: true, message: `Logged as ${req.body.username}; cookie ${ELoggedCookie.JWT} was set`, code: EAPILoginCode.Logged, qrDataUrl: dataUrl, link: getRoomLink(req.body.room) })
}
