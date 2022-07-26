/* eslint-disable no-shadow */
import { Request as IRequest, Response as IResponse } from 'express'
import { getStaticJSONSync } from '~/utils/fs-tools'

export const getAutoparkUsersMap = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse) => {
  try {
    const staticData = getStaticJSONSync(req.autopark2022StorageFilePath)

    return res.status(200).json({
      success: true,
      _originalQuery: req.query,
      staticData,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
