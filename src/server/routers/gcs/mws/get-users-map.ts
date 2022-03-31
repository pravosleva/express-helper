/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
// import { encode } from 'js-base64'
import { getStaticJSONSync } from '~/utils/fs-tools'
import { Singleton as UsersMapSingleton } from '~/utils/gcsUsersMapInstance'

export const getUsersMap = async (req: IRequest & { gcsUsersMapInstance: UsersMapSingleton, gcsStorageFilePath: string }, res: IResponse) => {
  const { id } = req.query

  const fakeItem = {
    "id": 222137588,
    "first_name": "hello mf",
    "last_name": "🍌",
    "type": "private",
    "count": 1000,
    "ts": 0
  }

  if (!id || typeof id !== 'string' || id !== 'loool') {
    const _staticData =  {}
    for (let i = 0, max = 1000; i < max; i++) {
      _staticData[`${Math.random()}`] = fakeItem
    }
    return res.status(200).json({ success: true, _staticData })
  }

  try {
    const state = req.gcsUsersMapInstance.getState()
    const _staticData = getStaticJSONSync(req.gcsStorageFilePath)

    return res.status(200).json({
      success: true,
      usersMap: state,
      // _pravosleva: {
      //   'http://pravosleva.ru/express-helper/gcs/add-user': encode('http://pravosleva.ru/express-helper/gcs/add-user'),
      //   'http://pravosleva.ru/express-helper/gcs/add-user?from=gcs': encode('http://pravosleva.ru/express-helper/gcs/add-user?from=gcs'),
      //   'http://pravosleva.ru/express-helper/gcs/add-user?from=pravosleva': encode('http://pravosleva.ru/express-helper/gcs/add-user?from=pravosleva'),
      // },
      _originalQuery: req.query,
      _staticData,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
