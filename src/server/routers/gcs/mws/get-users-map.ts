/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
import { encode } from 'js-base64'
import path from 'path'
import { getStaticJSONSync } from '../../../utils/fs-tools'
import { Singleton as UsersMapSingleton } from '../../../utils/gcsUsersMap'

// --- NOTE: FS tools
// TODO: storageFilePath пробрасывать в объект запроса?
const projectRootDir = path.join(__dirname, '../../../../')
const GCS_USERS_FILE_NAME = process.env.GCS_USERS_FILE_NAME || 'gcs-users.json'
const storageFilePath = path.join(projectRootDir, '/storage', GCS_USERS_FILE_NAME)
// ---

export const getUsersMap = async (req: IRequest & { gcsUsersMapInstance: UsersMapSingleton }, res: IResponse) => {
  try {
    const state = req.gcsUsersMapInstance.getState()

    return res.status(200).json({
      success: true,
      usersMap: state,
      _pravosleva: encode('http://pravosleva.ru/express-helper/gcs/add-user'),
      _staticData: getStaticJSONSync(storageFilePath),
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
