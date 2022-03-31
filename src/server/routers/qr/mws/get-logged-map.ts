import { Response as IResponse } from 'express'
import { ICustomRequest } from '../../../utils/interfaces'

export const getLoggedMap = async (req: ICustomRequest, res: IResponse) => {
  try {
    const state = {}
    req.loggedMap.state.forEach((value, key) => {
      state[key] = value
    })
    const _express = {
      'req.id': req.id,
      loggedSize: req.loggedMap.state.size,
      state,
    }

    return res.status(200).json({
      _express,
      ok: true,
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: typeof err === 'string' ? err : err.message || 'No err.message'
    })
  }
  
}
