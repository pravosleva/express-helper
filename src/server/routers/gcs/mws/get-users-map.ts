/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
import { encode } from 'js-base64'
import { getStaticJSONSync } from '../../../utils/fs-tools'
import { Singleton as UsersMapSingleton } from '../../../utils/gcsUsersMapInstance'

export const getUsersMap = async (req: IRequest & { gcsUsersMapInstance: UsersMapSingleton, gcsStorageFilePath: string }, res: IResponse) => {
  try {
    const state = req.gcsUsersMapInstance.getState()
    const _staticData = getStaticJSONSync(req.gcsStorageFilePath)

    return res.status(200).json({
      success: true,
      usersMap: state,
      _pravosleva: {
        'http://pravosleva.ru/express-helper/gcs/add-user': encode('http://pravosleva.ru/express-helper/gcs/add-user'),
        'http://pravosleva.ru/express-helper/gcs/add-user?from=gcs': encode('http://pravosleva.ru/express-helper/gcs/add-user?from=gcs'),
        'http://pravosleva.ru/express-helper/gcs/add-user?from=pravosleva': encode('http://pravosleva.ru/express-helper/gcs/add-user?from=pravosleva'),
      },
      _originalQuery: req.query,
      _staticData,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
