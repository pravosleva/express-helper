/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
import { getStaticJSONSync } from '~/utils/fs-tools'

export const getUsersMap = async (req: IRequest & {
  chatUsersStorageFilePath: string;
  chatRoomsStorageFilePath: string;
}, res: IResponse) => {
  try {
    const _staticUsersData = getStaticJSONSync<{data: any;ts: number}>(req.chatUsersStorageFilePath, {data:{},ts:1})
    const _staticRoomData = getStaticJSONSync<{data: any;ts: number}>(req.chatRoomsStorageFilePath, {data:{},ts:1})

    return res.status(200).json({
      success: true,
      _originalQuery: req.query,
      _staticData: {
        users: _staticUsersData,
        rooms: _staticRoomData,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
