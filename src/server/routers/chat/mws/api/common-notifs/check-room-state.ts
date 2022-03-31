import { Request as IRequest, Response as IResponse } from 'express'
import { commonNotifsMapInstance } from '~/utils/socket/state'
import { EAPIRoomNotifsCode } from './types'

export const checkRoomState = (req: IRequest, res: IResponse) => {
  const { room_id, tsUpdate: clientTsUpdate } = req.body

  if (!room_id) return res.status(400).send({
    ok: false,
    message: 'Params ERR: room_id is required',
    code: EAPIRoomNotifsCode.IncorrectParams,
    _originalBody: req.body,
  })

  if (!clientTsUpdate) {
    // NOTE: Первый раз спрашивает, в стейте еще ничего нет
    const roomNotifsStruct = commonNotifsMapInstance.get(room_id)

    if (!!roomNotifsStruct?.data && !!roomNotifsStruct.tsUpdate) {
      return res.status(200).send({
        ok: true,
        code: EAPIRoomNotifsCode.Exists,
        message: 'Данные нашлись',
        state: roomNotifsStruct.data,
        tsUpdate: roomNotifsStruct.tsUpdate,
        _originalBody: req.body,
      })
    } else {
      return res.status(200).send({
        ok: false,
        message: '1: Стейта не обнаружено, возможно он был удален или часть данных отсутствует',
        code: EAPIRoomNotifsCode.NotFound,
        _originalBody: req.body,
      })
    }
  }

  const roomNotifsStruct = commonNotifsMapInstance.get(room_id)
  if (!roomNotifsStruct?.data || !roomNotifsStruct?.tsUpdate) return res.status(200).send({
    ok: false,
    message: '2: Стейта не обнаружено, возможно он был удален или часть данных отсутствует',
    code: EAPIRoomNotifsCode.NotFound,
    _originalBody: req.body,
  })
  
  if (roomNotifsStruct.tsUpdate === clientTsUpdate) return res.status(200).send({
    ok: false,
    message: 'Изменений еще не было',
    // state: roomNotifsStruct.data,
    code: EAPIRoomNotifsCode.NoUpdates,
    _originalBody: req.body,
  })

  return res.status(200).send({
    ok: true,
    code: EAPIRoomNotifsCode.Updated,
    message: 'Есть обновления...',
    state: roomNotifsStruct.data,
    tsUpdate: roomNotifsStruct.tsUpdate,
    _originalBody: req.body,
  })
}
