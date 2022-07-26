import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import { getRandomInteger } from '~/utils/getRandomInteger'

function isNumeric(n: any): boolean {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

type TUserData = {
  tg: {
    chat_id: number;
  },
  ts: number;
  password: number
}
type TStaticData = {
  [key: string]: TUserData
}

export const checkAutoparkUserPassword = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { password, chat_id } = req.body

  if (!password) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrParams,
      _originalBody: { params: req.body },
    })
  }

  if (!!req.autopark2022StorageFilePath) {
    try {
      const staticData: TStaticData = getStaticJSONSync(req.autopark2022StorageFilePath)
      const isUserExists = !!staticData[String(chat_id)]
      const response: any = { ok: false }

      if (isUserExists && isNumeric(password) && staticData[String(chat_id)].password === Number(password)) {
        response.ok = true
      } else {
        response.message = 'Incorrect password'
      }

      // -- NOTE: Update password
      const ts = new Date().getTime()
      const newPassword = getRandomInteger(1000, 9999)

      const modifiedData = { ...staticData[String(chat_id)], password: newPassword, ts }

      staticData[String(chat_id)] = modifiedData
      writeStaticJSONAsync(req.autopark2022StorageFilePath, staticData)
      // --

      return res.status(200).json(response)
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        ok: false,
        message: err.message || 'No err.message',
        _originalParams: { params: req.params },
        code: EAPIUserCode.ServerError,
      })
    }
  }
  next()
}
