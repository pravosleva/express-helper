import { Request as IRequest, Response as IResponse } from 'express'
import { writeStaticJSONAsync, getStaticJSONSync } from '../../../utils/fs-tools'
import { Singleton as UsersMapSingleton } from '../../../utils/gcsUsersMapInstance'

export const addUser = async (req: IRequest & { gcsUsersMapInstance: UsersMapSingleton, gcsStorageFilePath: string }, res: IResponse) => {
  const { userName, chatData } = req.body
  const { from } = req.query
  const requiredParams: string[] = ['userName', 'chatData']
  const _skipedParams = []

  requiredParams.forEach((param) => {
    if (!req.body[param]) _skipedParams.push(param)
  })
  if (_skipedParams.length > 0) {
    return res
      .status(401)
      .json({ success: false, message: `Missing required parameter${_skipedParams.length > 1 ? 's' : ''}: ${_skipedParams.join(', ')}` })
  }

  // NOTE: Update local state
  req.gcsUsersMapInstance.addUser({ userName, data: chatData })

  const uniqueKey: string = userName
  const staticData = getStaticJSONSync(req.gcsStorageFilePath)
  const ts = new Date().getTime()
  let myNewData: any = { ...chatData }
  const myOldData = staticData[uniqueKey]

  if (!!myOldData) myNewData = { ...myOldData, ...myNewData }

  if (myNewData?.count) {
    const count = myNewData?.count

    myNewData = { ...myNewData, count: count + 1, ts }
  } else {
    myNewData = { ...myNewData, count: 1, ts }
  }

  staticData[uniqueKey] = myNewData

  // NOTE: Update global state
  if (from === 'gcs') writeStaticJSONAsync(req.gcsStorageFilePath, staticData)

  return res.status(200).json({ success: true })
}
