import { Response as IResponse } from 'express'
import { ICustomRequest } from '../../../utils/interfaces'

export const tryAuthOnOtherDevice = async (req: ICustomRequest, res: IResponse) => {
  const { logged_req_id } = req.query
  const _express = {
    'req.id': req.id,
    loggedSize: req.loggedMap.state.size
  }

  if (!logged_req_id) {
    return res
      .status(401)
      .json({ _express, ok: false, message: 'Missing required parameter: "logged_req_id"' })
  }

  try {
    // --- NOTE: При генерации qr была создана возможность
    // аутентифицироваться на других устройствах, используя req.id:
    if (typeof logged_req_id !== 'string') {
      throw new Error('typeof req.query.logged_req_id should be string!')
    }

    const result = await req.loggedMap.addLoggedSessionOrDelete(logged_req_id)
      .then((message: string) => ({
        isOk: true,
        message,
      }))
      .catch((err) => ({
        isOk: false,
        message: typeof err === 'string' ? err : err.message || 'No err.message',
      }))
    // ---

    return res.status(200).json({
      _express: {
        ..._express, 
        loggedSize: req.loggedMap.state.size,
      },
      ok: result.isOk,
      message: result.message,
    })
  } catch (err) {
    return res.status(500).json({
      _express: {
        ..._express, 
        loggedSize: req.loggedMap.state.size,
      },
      ok: false,
      message: typeof err === 'string' ? err : err?.message || 'No err.message',
    })
  }
}
