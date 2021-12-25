import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const checkJWT = (jwtSecret: string, cookieName: string) => (req: IRequest & { user?: any }, res: IResponse, next: INextFunction) => {
  // console.log(req.cookies)
  if (!!req.cookies && !!req.cookies[cookieName]) {
    try {
      const data: any = jwt.verify(req.cookies[cookieName], jwtSecret)
      if (typeof data.username === 'string') {
        return res.status(200).json({ ok: true, code: 'logged' })
      }
      return res.status(200).json({ ok: false, code: 'unlogged' })
    } catch (err) {
      return res.status(401).json({
        message: 'Ошибка аутентификации #1',
        code: `Failed to authenticate token: ${err.message || 'No err.message'}`,
      })
    }
  } else {
    return res
      .status(403)
      .json({ message: 'Ошибка аутентификации #2', code: `Forbidden: No token in cookies['${cookieName}']` })
  }
}
