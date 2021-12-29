import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
// import { TUser } from '~/routers/chat/utils/types'
import jwt from 'jsonwebtoken'
import { registeredUsersMapInstance as registeredUsersMap } from '~/utils/socket/state/registeredUsersMapInstance'
import { TRegistryData } from '~/utils/socket/state/types'

// const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

export const mutateReqIfLogged = (jwtSecret: string, cookieName: string) => (req: IRequest & { regData?: TRegistryData }, _res: IResponse, next: INextFunction) => {
  if (isDev) {
    const developer = 'pravosleva'
    const regData = registeredUsersMap.get(developer)
    req.regData = regData
  } else if (!!req.cookies && !!req.cookies[cookieName]) {
    /*
    * Try to decode & verify the JWT token
    * The token contains user's id ( it can contain more informations )
    * and this is saved in req.user object
    */
    try {
      const jwtParsed: any = jwt.verify(req.cookies[cookieName], jwtSecret)
      console.log(jwtParsed)

      if (typeof jwtParsed?.username === 'string') {
        const regData = registeredUsersMap.get(jwtParsed.username)

        if (!!regData) req.regData = regData
      }
      // return res.status(500).json({ message: 'tst1', ok: false })
    } catch (err) {
      // NOTE: For example, JsonWebTokenError: invalid signature
      console.log('err #riu1')
      console.log(err)
      // return res.status(500).json({ message: 'tst2', ok: false })
    }
    // --
  }

  return next()
}
