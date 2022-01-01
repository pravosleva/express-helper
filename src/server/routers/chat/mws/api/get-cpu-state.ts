import { Request, Response } from 'express'
import { cpuStateInstance } from '~/utils/socket/state'

export const getCPUState = (req: Request, res: Response) => {
  const { key } = req.query

  if (!!key && typeof key === 'string') {
    const currentValue = cpuStateInstance.get(key)

    if (!!currentValue) {
      return res.status(200).send({
        ok: true,
        state: currentValue,
        _originalQuery: req.query,
      })
    } else {
      return res.status(200).send({
        ok: false,
        message: 'Unknown key in params',
        _originalQuery: req.query,
      })
    }
  } else {
    // const registeredUserData = registeredUsersMapInstance.get(username)
    try {
      const state = cpuStateInstance.getState()

      return res.status(200).send({
        ok: true,
        state,
        _originalQuery: req.query,
      })
    } catch (err) {
      return res.status(200).send({
        ok: false,
        message: err.message,
        _originalQuery: req.query,
      })
    }
  }
}