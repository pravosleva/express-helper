import { Response as IResponse } from 'express'
import { ICustomRequest } from '../../../utils/interfaces'

export const clearState = async (req: ICustomRequest, res: IResponse) => {
  try {
    req.loggedMap.clearState()

    return res.status(200).json({ ok: true, loggedStateSize: req.loggedMap.state.size })
  } catch (err) {
    return res.status(200).json({ ok: false, message: err.message || 'No err.message' })
  }
}
