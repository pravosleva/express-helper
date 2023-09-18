import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import jwt from 'jsonwebtoken'

const jwtSecret = 'super-secret'
const jwtCookieName = 'autopark-2022.jwt' // chat_id

export const checkJWT = async (req: IRequest, res: IResponse, next: INextFunction) => {
  const { tested_chat_id } = req.body

  if (!tested_chat_id) return res.status(400).send({
    ok: false,
    message: 'Incorrect req.boby params',
    _originalBody: { params: req.body },
  })

  const response: any = { ok: false }

  try {
    const jwtParsed: any = jwt.verify(req.cookies[jwtCookieName], jwtSecret)

    if (jwtParsed.chat_id !== tested_chat_id) {
      response.ok = false
      response.message = 'Unauth'
    } else {
      response.ok = true
    }

    response._originalBody = { params: req.body }

    return res.status(200).json(response)
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message',
      _originalBody: { params: req.body },
    })
  }
}
