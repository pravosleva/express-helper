import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types'

export const logoutAutoparkUser = async (req: IRequest, res: IResponse, next: INextFunction) => {
  try {
    // Очищаем HTTP-only куку, которая использовалась для авторизации
    res.clearCookie('autopark-2022.jwt', { httpOnly: true })
    
    return res.status(200).json({
      ok: true,
      message: 'Logged out successfully'
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ok: false,
      message: (err as Error)?.message || 'No err.message',
      code: EAPIUserCode.ServerError,
    })
  }
}
