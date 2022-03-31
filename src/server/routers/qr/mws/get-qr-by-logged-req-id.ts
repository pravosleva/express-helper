import { Response as IResponse } from 'express'
import { ICustomRequest } from '../../../utils/interfaces'

export const getQRByLoggedReqId = async (req: ICustomRequest, res: IResponse) => {
  const { logged_req_id } = req.query

  const _express = {
    'req.id': req.id,
  }

  if (!logged_req_id) {
    return res
      .status(401)
      .json({ _express, ok: false, message: 'Missing required parameter: "logged_req_id"' })
  }

  const qrData = req.loggedMap.state.get(logged_req_id)
  if (!qrData) {
    return res
      .status(404)
      .json({ _express, ok: false, message: 'Not found' })
  }

  return res.status(200).json({
    _express: {
      ..._express, 
      loggedSize: req.loggedMap.state.size,
    },
    ok: true,
    qrData,
    src: qrData.qr,
  })
}
