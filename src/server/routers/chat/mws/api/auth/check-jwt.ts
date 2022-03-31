import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from './types'
import { TRegistryData } from '~/utils/socket/state/types'

export const checkJWT = (req: IRequest & { regData?: TRegistryData, needLogout?: boolean }, res: IResponse, next: INextFunction) => {
  const requiredParams = ['username']
  const errs = []
  for (const param of requiredParams) if (!req.body[param]) errs.push(param)
  if (errs.length > 0) return res.status(200).send({
    ok: false,
    message: `Params ERR: ${errs.join(', ')} is required`,
    code: EAPIUserCode.IncorrectParams,
    _originalBody: req.body,
  })

  if (req.needLogout) return res.status(200).json({
    ok: false,
    code: EAPIUserCode.NeedLogout,
    regData: req.regData,
  })

  if (!!req.regData) {
    try {
      return res.status(200).json({ ok: true, code: EAPIUserCode.Logged, regData: req.regData })
    } catch (err) {
      return res.status(401).json({
        message: `Ошибка аутентификации #1\n${err.message || 'No err.message'}`,
        code: EAPIUserCode.Unlogged
      })
    }
  } else {
    return res.status(200).json({ ok: false, code: EAPIUserCode.Unlogged })
  }
}
