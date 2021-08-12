import { Request as IRequest, Response as IResponse } from 'express'
import { writeStaticJSONAsync, getStaticJSONSync } from '../../../utils/fs-tools'
import { Singleton as UsersMapSingleton } from '../../../utils/gcsUsersMap'

export const addUser = async (req: IRequest & { gcsUsersMapInstance: UsersMapSingleton, gcsStorageFilePath: string }, res: IResponse) => {
  const { userName, chatData } = req.body
  const requiredParams: string[] = ['userName', 'chatData']
  const _skipedParams = []

  requiredParams.forEach((param) => {
    if (!req.body[param]) _skipedParams.push(param)
  })
  if (_skipedParams.length > 0) {
    return res
      .status(401)
      .json({ ok: false, message: `Missing required parameter${_skipedParams.length > 1 ? 's' : ''}: ${_skipedParams.join(', ')}` })
  }

  const uniqueKey = userName || String(chatData?.id) || 'no-data'
  const staticData = getStaticJSONSync(req.gcsStorageFilePath)
  const ts = new Date().getTime()
  let myNewData: any = { ...chatData }
  const myOldStaticData = staticData[uniqueKey]

  if (!!myOldStaticData) {
    myNewData = { ...myOldStaticData, ...chatData }
  }

  if (myNewData?.count) {
    const count = myNewData?.count

    myNewData = { ...myNewData, count: count + 1, ts }
  } else {
    myNewData = { ...myNewData, count: 1, ts }
  }

  req.gcsUsersMapInstance.addUser({ userName, data: chatData })

  staticData[uniqueKey] = myNewData
  writeStaticJSONAsync(req.gcsStorageFilePath, staticData)

  return res.status(200).json({ success: true })
}
