import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { TUser } from '~/routers/chat/utils/types'
import jwt from 'jsonwebtoken'
import buildUrl from 'build-url'

const EXTERNAL_ROUTING = process.env.EXTERNAL_ROUTING || ''

export const redirectIfUnlogged = (jwtSecret: string, cookieName: string) => (req: IRequest & { user?: TUser }, res: IResponse, next: INextFunction) => {
  // --- NOTE: REDIRECT LOGGED CLIENT who has permission to work with the current agent
  const { room } = req.query

  // console.log('-- req.query')
  // console.log(req.query)
  // console.log('--')
  // console.log('-- req.body')
  // console.log(req.body)
  // console.log('--')

  if (!!req.cookies && !!req.cookies[cookieName]) {
    /*
    * Try to decode & verify the JWT token
    * The token contains user's id ( it can contain more informations )
    * and this is saved in req.user object
    */
    try {
      const jwtParsed: any = jwt.verify(req.cookies[cookieName], jwtSecret)
      // console.log(jwtParsed)
      /* SAMPLE:
      {
        room: '13',
        user: 'pravosleva',
        iat: 1640215923,
        exp: 1640388723
      } */
      if (
        !!jwtParsed?.user
      ) {
        // TODO: ALLOW IF LOGGED
        return next()
      }
      return res.status(200).json({ message: 'Ты кто, епте?', ok: false })
      // return res.redirect('/chat-login')
    } catch (err) {
      // NOTE: For example, JsonWebTokenError: invalid signature
      // console.log('err #riu1')
      // console.log(err)
      return res.status(500).json({ message: 'Oops... Fuckup', ok: false })
      // return res.redirect('/chat-login')
    }
    // --
  } else {
    return res.redirect(buildUrl(`${EXTERNAL_ROUTING}/chat-login`, {
      queryParams: {
        room: typeof room === 'string' ? room : undefined,
      }
    }))
  }
  // ---
}
