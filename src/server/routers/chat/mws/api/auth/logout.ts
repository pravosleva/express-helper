import { Request as IRequest, Response as IResponse } from 'express'
// import buildUrl from 'build-url'
// import { getMsByDays } from '~/utils/auth/getMsByDays'
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import { registeredUsersMapInstance as usersMap } from '~/utils/socket/state/registeredUsersMapInstance'
// import { EAPILoginCode, ELoggedCookie } from '~/routers/chat/utils/types'

// const EXTERNAL_ROUTING = process.env.EXTERNAL_ROUTING || ''

// const genDataUrl: (payload: string) => Promise<string> = promisify(QRCode.toDataURL.bind(QRCode))
// const getRoomLink = (room: string) => `${EXTERNAL_ROUTING}/chat/#/?room=${room}`

export const logout = (cookieName: string) => async (req: IRequest, res: IResponse) => {
  res.clearCookie(cookieName)
  res
    .status(200)
    .json({ ok: true, message: 'Unlogged' })
}
