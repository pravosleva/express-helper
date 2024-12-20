import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types'
import {
  // writeStaticJSONAsync,
  getStaticJSONSync,
} from '~/utils/fs-tools'
// import { getRandomInteger } from '~/utils/getRandomInteger'

// const isDev = process.env.NODE_ENV === 'development'

type TProjectData = {
  name: string;
  description: string;
  items: any[];
}
type TUserData = {
  tg: {
    chat_id: number;
    username: string;
  },
  ts: number;
  password: number;
  projects?: {
    [key: string]: TProjectData
  }
}
type TStaticData = {
  [key: string]: TUserData
}

export const checkAutoparkUser = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
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
      res.startTime('read_storage_file_sync', req.autopark2022StorageFilePath)
      const staticData: TStaticData = getStaticJSONSync<TStaticData>(req.autopark2022StorageFilePath, {})
      res.endTime('read_storage_file_sync')

      if (!staticData[String(chat_id)]) return res.status(200).json({
        ok: false,
        message: 'User does not exists',
        code: EAPIUserCode.NotFound,
      })

      // const ts = new Date().getTime()
      // const password = getRandomInteger(1000, 9999)

      // let myNewData: Partial<TUserData> = { tg, ts }
      // const myOldData: TUserData = staticData[String(chat_id)]

      // if (!!myOldData) myNewData = { ...myOldData, ...myNewData }

      // myNewData = { ...myNewData, ts }
      // staticData[String(chat_id)] = myNewData

      // writeStaticJSONAsync(req.autopark2022StorageFilePath, staticData)

      const isUserExists = !!staticData[String(chat_id)]
      const response: any = { ok: isUserExists, code: EAPIUserCode.UserExists }

      if (req.query.p === '1') response.password = staticData[String(chat_id)]?.password || null

      if (
        !!staticData[String(chat_id)]?.projects
        && Object.keys(staticData[String(chat_id)].projects).length > 0
      ) response.projects = staticData[String(chat_id)].projects

      // if (isDev) response.password = password

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
