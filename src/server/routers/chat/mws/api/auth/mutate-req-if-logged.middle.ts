import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
// import { TUser } from '~/routers/chat/utils/types'
import jwt from 'jsonwebtoken'
import { registeredUsersMapInstance as registeredUsersMap } from '~/utils/socket/state/registeredUsersMapInstance'
import { TRegistryData } from '~/utils/socket/state/types'

// const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

export const mutateReqIfLogged = (jwtSecret: string, cookieName: string) => (req: IRequest & { needLogout?: boolean, regData?: TRegistryData }, _res: IResponse, next: INextFunction) => {
  console.log('-- mw: mutateReqIfLogged')

  // if (isDev) {
  //   console.log('CASE 1')
  //   const developer = 'pravosleva'
  //   const regData = registeredUsersMap.get(developer)
  //   req.regData = regData
  // } else
  if (!!req.cookies && !!req.cookies[cookieName]) {
    console.log('CASE 2')
    /*
    * Try to decode & verify the JWT token
    * The token contains user's id ( it can contain more informations )
    * and this is saved in req.user object
    */
    try {
      const jwtParsed: any = jwt.verify(req.cookies[cookieName], jwtSecret)
      // console.log(jwtParsed)

      const username = req.body.username

      console.log(`req.body.username= ${req.body.username}`)

      if (typeof jwtParsed?.username === 'string' && !!req.body.username) {
        const regData = registeredUsersMap.get(jwtParsed.username)

        console.log('- jwtParsed')
        console.log(jwtParsed)
        console.log('-')

        console.log(`- username by front: ${username}`)

        switch (true) {
          case (!!regData && regData.tg?.username !== username):
            req.needLogout = true
            console.log(`-- case 1: regData.tg?.username= ${regData.tg?.username}, req.body.username= ${username}`)
            break;
          case (!!regData && regData.tg?.username === username):
            console.log(`-- case 2: regData.tg?.username= ${regData.tg?.username}, req.body.username= ${username}`)
            req.regData = regData
            break;
          default: break;
        }
      }
      // return res.status(500).json({ message: 'tst1', ok: false })
    } catch (err) {
      // NOTE: For example, JsonWebTokenError: invalid signature
      console.log('err #riu1')
      console.log(err)
      // return res.status(500).json({ message: 'tst2', ok: false })
    }
    // --
  } else {
    console.log('CASE 3')
  }

  console.log(req.regData)

  return next()
}
