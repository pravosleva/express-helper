import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import { getRandomInteger } from '~/utils/getRandomInteger';

type TUserData = {
  tg: {
    chat_id: number;
    username: string;
  },
  ts: number;
  password: number;
}
type TStaticData = {
  [key: string]: TUserData
}

export const addAutoparkUser = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { tg } = req.body

  if (!tg) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrParams,
      _originalParams: { params: req.params },
    })
  }

  if (!!req.autopark2022StorageFilePath) {
    try {
      const { chat_id } = tg
  
      const staticData: TStaticData = getStaticJSONSync<TStaticData>(req.autopark2022StorageFilePath, {})
      const ts = new Date().getTime()
      const password = getRandomInteger(1000, 9999)
      let myNewData: TUserData = { tg, ts, password }
      const myOldData: TUserData = staticData[String(chat_id)]

      if (!!myOldData) myNewData = { ...myOldData, ...myNewData }

      myNewData = { ...myNewData, ts }
      staticData[String(chat_id)] = myNewData

      writeStaticJSONAsync(req.autopark2022StorageFilePath, staticData)

      return res.status(200).json({ ok: true, staticData, code: EAPIUserCode.Created, password })
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
