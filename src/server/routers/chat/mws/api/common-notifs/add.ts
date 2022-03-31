import { Request as IRequest, Response as IResponse } from 'express'
import { commonNotifsMapInstance } from '~/utils/socket/state'
import { EAPIRoomNotifsCode, TRoomNotifs } from './types'

export const add = (req: IRequest, res: IResponse) => {
  const { room_id, ts, tsTarget, username, text, original } = req.body

  // TODO: Не удалось получить user из JWT
  // if (!req.user)

  const requiredParams = ['username', 'ts', 'tsTarget', 'room_id', 'text', 'original']
  const errs = []
  for (const param of requiredParams) if (!req.body[param]) errs.push(param)
  if (errs.length > 0) return res.status(401).send({
    ok: false,
    message: `Params ERR: ${errs.join(', ')} is required`,
    code: EAPIRoomNotifsCode.IncorrectParams,
    _originalBody: req.body,
  })

  const newStateChunk = { [String(ts)]: { username, ts, tsTarget, text, original } }
  const newTs = Date.now()

  let oldRoomNotifsStruct = commonNotifsMapInstance.get(room_id)
  if (!oldRoomNotifsStruct) {
    // 1. Create new
    try {
      commonNotifsMapInstance.set(room_id, { data: newStateChunk, tsUpdate: newTs })
      oldRoomNotifsStruct = { data: newStateChunk, tsUpdate: newTs }
    } catch (err) {
      return res.status(500).send({
        ok: false,
        message: err.message || 'ERR1',
        code: EAPIRoomNotifsCode.Errored,
        _originalBody: req.body,
      })
    }
  }

  // 2. Update state: oldRoomNotifsStruct exists
  const newRoomNotifsStruct: TRoomNotifs = { data: { ...oldRoomNotifsStruct.data, [String(ts)]: { ts, tsTarget, username, text, original } }, tsUpdate: newTs }

  try {
    commonNotifsMapInstance.set(room_id, newRoomNotifsStruct)
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message || 'ERR2',
      code: EAPIRoomNotifsCode.Errored,
      _originalBody: req.body,
    })
  }

  return res.status(200).send({
    ok: true,
    code: EAPIRoomNotifsCode.Updated,
    message: 'State updated',
    stateChunk: newStateChunk,
    tsUpdate: newTs,
    ts,
    _originalBody: req.body,
  })
}
