import { Request as IRequest, Response as IResponse } from 'express'
import path from 'path'
import { writeStaticJSONAsync, getStaticJSONSync } from '../../../utils/fs-tools'
import { Singleton } from '../../../utils/gcsUsersMap'

// --- NOTE: FS tools
const projectRootDir = path.join(__dirname, '../../../../')
const GCS_USERS_FILE_NAME = process.env.GCS_USERS_FILE_NAME || 'gcs-users.json'
const storageFilePath = path.join(projectRootDir, '/storage', GCS_USERS_FILE_NAME)
// ---

export const addUser = async (req: IRequest & { gcsUsersMapInstance: Singleton }, res: IResponse) => {
  const { userName, chatData } = req.body

  if (!userName || !chatData) {
    return res
      .status(401)
      .json({ ok: false, message: 'Missing required parameter: "payload"' })
  }

  req.gcsUsersMapInstance.addUser({ userName, chatData })

  const json = getStaticJSONSync(storageFilePath)
  json[userName] = chatData
  writeStaticJSONAsync(storageFilePath, json)

  return res.status(200).json({ success: true })
}
