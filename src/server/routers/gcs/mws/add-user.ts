import { Request as IRequest, Response as IResponse } from 'express'
import path from 'path'
import { writeStaticJSONAsync, getStaticJSONSync } from '../../../utils/fs-tools'
import { Singleton as UsersMapSingleton } from '../../../utils/gcsUsersMap'

// --- NOTE: FS tools
const projectRootDir = path.join(__dirname, '../../../../')
const GCS_USERS_FILE_NAME = process.env.GCS_USERS_FILE_NAME || 'gcs-users.json'
const storageFilePath = path.join(projectRootDir, '/storage', GCS_USERS_FILE_NAME)
// ---

export const addUser = async (req: IRequest & { gcsUsersMapInstance: UsersMapSingleton }, res: IResponse) => {
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

  req.gcsUsersMapInstance.addUser({ userName, chatData })

  const json = getStaticJSONSync(storageFilePath)
  json[userName] = chatData
  writeStaticJSONAsync(storageFilePath, json)

  return res.status(200).json({ success: true })
}
