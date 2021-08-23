import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { writeStaticJSONAsync, getStaticJSONSync } from '../../../utils/fs-tools'

type TUserData = {
  company: string
  position: string
  feedback: string
  contact: {
    [key: string]: any
    user_id: number
  }
  files: {
    [key: string]: {
      fileUrl: string
    }
  }
  ts?: number
  count?: number
}
type TStaticData = {
  [key: string]: TUserData
}

export const addEntryRoute = async (req: IRequest & { botStorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { userState } = req.body

  if (!userState) {
    return res.status(401).send({
      success: false,
      _originalParams: { params: req.params },
    })
  }

  if (!!req.botStorageFilePath) {
    try {
      const { entryData: { contact: { user_id } } } = userState
  
      const staticData: TStaticData = getStaticJSONSync(req.botStorageFilePath)
      const ts = new Date().getTime()
      let myNewData: TUserData = { ...userState }
      const myOldData: TUserData = staticData[String(user_id)]

      if (!!myOldData) myNewData = { ...myOldData, ...myNewData }

      myNewData = { ...myNewData, count: myNewData?.count ? myNewData?.count + 1 : 1, ts }
      staticData[String(user_id)] = myNewData

      writeStaticJSONAsync(req.botStorageFilePath, staticData)

      return res.status(200).json({ ok: true, staticData })
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        ok: false,
        message: err.message || 'No err.message',
        _originalParams: { params: req.params },
      })
    }
  }
  next()
}
