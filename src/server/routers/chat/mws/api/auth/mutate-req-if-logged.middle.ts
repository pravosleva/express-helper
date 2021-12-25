import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { TUser } from '~/routers/chat/utils/types'
import jwt from 'jsonwebtoken'

export const mutateReqIfLogged = (jwtSecret: string, cookieName: string) => (req: IRequest & { user?: TUser }, res: IResponse, next: INextFunction) => {
  // --- NOTE: REDIRECT LOGGED CLIENT who has permission to work with the current agent
  if (!!req.cookies && !!req.cookies[cookieName]) {
    /*
    * Try to decode & verify the JWT token
    * The token contains user's id ( it can contain more informations )
    * and this is saved in req.user object
    */
    try {
      const jwtParsed: any = jwt.verify(req.cookies[cookieName], jwtSecret)
      console.log(jwtParsed)
      if (typeof jwtParsed?.username === 'string') req.user = jwtParsed?.username
      // return res.status(500).json({ message: 'tst1', ok: false })
    } catch (err) {
      // NOTE: For example, JsonWebTokenError: invalid signature
      console.log('err #riu1')
      console.log(err)
      // return res.status(500).json({ message: 'tst2', ok: false })
    }
    // --
  }
  // ---

  return next()
}
