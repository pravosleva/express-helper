import { Request as IRequest, Response as IResponse } from 'express'
import { commonNotifsMapInstance } from '~/utils/socket/state'
import { EAPIRoomNotifsCode, TRoomNotifs, TData } from './types'

export const remove = (req: IRequest, res: IResponse) => {
  const { room_id, ts, username } = req.body

  // TODO: Не удалось получить user из JWT
  // if (!req.user)

  const requiredParams = ['ts', 'room_id']
  const errs = []
  for (const param of requiredParams) if (!req.body[param]) errs.push(param)
  if (errs.length > 0) return res.status(401).send({
    ok: false,
    message: `Params ERR: ${errs.join(', ')} is required`,
    code: EAPIRoomNotifsCode.IncorrectParams,
    _originalBody: req.body,
  })


  const oldRoomNotifsStruct = commonNotifsMapInstance.get(room_id)
  if (!oldRoomNotifsStruct) return res.status(500).send({
    ok: false,
    message: 'ERR1: Стейт не обнаружен',
    code: EAPIRoomNotifsCode.Errored,
    _originalBody: req.body,
  })

  // 2. Update state: oldRoomNotifsStruct exists
  const newTs = Date.now()
  const newRoomNotifsStruct: TData = { ...oldRoomNotifsStruct.data }
  delete newRoomNotifsStruct[String(ts)]

  // console.log(newRoomNotifsStruct)

  try {
    commonNotifsMapInstance.set(room_id, { data: newRoomNotifsStruct, tsUpdate: newTs })
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
    message: `Item deleted by ${username} (TODO: Remove on front)`,
    tsUpdate: newTs,
    ts,
    _originalBody: req.body,
  })
}
