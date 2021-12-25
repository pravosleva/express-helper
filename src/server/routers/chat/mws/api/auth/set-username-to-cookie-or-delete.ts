import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { TUser } from '~/routers/chat/utils/types'
import jwt from 'jsonwebtoken'
// import buildUrl from 'build-url'
import { getMsByDays } from '~/utils/auth/getMsByDays'


const EXTERNAL_ROUTING = process.env.EXTERNAL_ROUTING || ''
// const getUrl = ({ url, username }: { url: string, username: string }) => buildUrl(`${EXTERNAL_ROUTING}${url}`, {
//   queryParams: {
//     username,
//   },
// })

export const setUsernameToCookieOrDelete = (jwtSecret: string, cookieName: string) => (req: IRequest & { user?: TUser }, res: IResponse, next: INextFunction) => {
  // --- NOTE: REDIRECT LOGGED CLIENT who has permission to work with the current agent
  if (!!req.cookies && !!req.cookies[cookieName]) {
    /*
    * Try to decode & verify the JWT token
    * The token contains user's id ( it can contain more informations )
    * and this is saved in req.user object
    */
    try {
      const jwtParsed: any = jwt.verify(req.cookies[cookieName], jwtSecret)
      // console.log(jwtParsed)
      // console.log(req)
      // console.log(getUrl({ url: req.originalUrl, username: jwtParsed?.username }))
      if (typeof jwtParsed?.username === 'string' && typeof jwtParsed?.tgChatId === 'string') {
        // req.query.username = jwtParsed?.user
        // Set to cookie:
        const maxAge = getMsByDays(1)

        res.cookie('chat.username', jwtParsed?.username, { maxAge, httpOnly: false })
        res.cookie('chat.tg_chat_id', jwtParsed?.tgChatId, { maxAge, httpOnly: false })
      } else {
        res.clearCookie('chat.username')
        res.clearCookie('chat.tg_chat_id')
      }
      // return res.status(500).json({ message: 'tst1', ok: false })
    } catch (err) {
      // NOTE: For example, JsonWebTokenError: invalid signature
      console.log('err #riu1')
      console.log(err)
      return res.status(500).json({ message: 'tst2', ok: false })
    }
    // --
  }
  // ---

  return next()
}
