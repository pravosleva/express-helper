/* eslint-disable no-shadow */
import { Request, Response, NextFunction } from 'express'
import { getStaticJSONSync } from '../../../utils/fs-tools'

export const getEntriesMapRoute = async (req: Request, res: Response, next: NextFunction) => {
  if (!!req.botStorageFilePath) {
    try {
      const staticData = getStaticJSONSync<any>(req.botStorageFilePath, {})

      return res.status(200).json({
        success: true,
        _originalQuery: req.query,
        staticData,
      })
    } catch (err) {
      return res.status(500).json({ success: false, message: (err as Error)?.message || 'No err message' })
    }
  }
  next()
}
