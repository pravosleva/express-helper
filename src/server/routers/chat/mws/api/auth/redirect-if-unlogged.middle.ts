import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { TUser } from '~/routers/chat/utils/types'
import jwt from 'jsonwebtoken'

export const redirectIfUnlogged = (jwtSecret: string, cookieName: string) => (req: IRequest & { user?: TUser }, res: IResponse, next: INextFunction) => {
  // --- NOTE: REDIRECT LOGGED CLIENT who has permission to work with the current agent
  if (!!req.cookies && !!req.cookies[cookieName]) {
    /*
    * Try to decode & verify the JWT token
    * The token contains user's id ( it can contain more informations )
    * and this is saved in req.user object
    */
    try {
      const jwtParsed = jwt.verify(req.cookies[cookieName], jwtSecret)
      console.log(jwtParsed)
      /// TODO: ALLOW IF LOGGED
      // if (req.user.id) {
      //   return res.redirect('http://google.com')
      //   return next()
      // }
      // return res.status(500).json({ message: 'tst3', ok: false })
      return res.redirect('http://google.com')
    } catch (err) {
      // NOTE: For example, JsonWebTokenError: invalid signature
      // console.log('err #riu1')
      // console.log(err)
      // return res.status(500).json({ message: 'tst4', ok: false })
      return res.redirect('http://google.com')
    }
    // --
  } else {
    // return res.status(500).json({ message: 'tst5', ok: false })
    return res.redirect('http://google.com')
  }
  // ---
}
