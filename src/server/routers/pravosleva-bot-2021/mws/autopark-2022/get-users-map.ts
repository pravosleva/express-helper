/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
import { getStaticJSONSync } from '~/utils/fs-tools'

export const getAutoparkUsersMap = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse) => {
  try {
    res.startTime('read_storage_file_sync', req.autopark2022StorageFilePath)
    const staticData = getStaticJSONSync(req.autopark2022StorageFilePath)
    res.endTime('read_storage_file_sync')

    return res.status(200).json({
      success: true,
      _originalQuery: req.query,
      staticData,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
