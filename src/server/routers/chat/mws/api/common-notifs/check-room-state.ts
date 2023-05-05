import { Request as IRequest, Response as IResponse } from 'express'
import { commonNotifsMapInstance } from '~/utils/socket/state'
import { EAPIRoomNotifsCode } from './types'
import { THelp } from '~/utils/express-validation'

export const checkRoomStateRules: THelp = {
  params: {
    body: {
      room_id: {
        type: 'string',
        descr: 'Room name',
        required: true,
        validate: (val: any) => ({
          ok: !!val && typeof val === 'string',
          reason: 'Should be string & not empty',
          _reponseDetails: {
            status: 400,
            _addProps: {
              code: EAPIRoomNotifsCode.IncorrectParams,
            }
          }
        }),
      },
      tsUpdate: {
        type: 'number',
        descr: 'Client timestamp (last update)',
        required: true,
        validate: (val: any) => ({
          ok: !!val && typeof val === 'number',
          reason: 'Should be number & > 0',
          _reponseDetails: {
            status: 400,
            _addProps: {
              code: EAPIRoomNotifsCode.IncorrectParams,
            }
          }
        }),
      },
    },
  }
}

export const checkRoomState = (req: IRequest, res: IResponse) => {
  const { room_id, tsUpdate: clientTsUpdate } = req.body

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
        _service: {
          originalBody: req.body,
        },
      })
    } else {
      return res.status(200).send({
        ok: false,
        message: '1: Стейта не обнаружено, возможно он был удален или часть данных отсутствует',
        code: EAPIRoomNotifsCode.NotFound,
        _service: {
          originalBody: req.body,
        },
      })
    }
  }

  const roomNotifsStruct = commonNotifsMapInstance.get(room_id)
  if (!roomNotifsStruct?.data || !roomNotifsStruct?.tsUpdate) return res.status(200).send({
    ok: false,
    message: '2: Стейта не обнаружено, возможно он был удален или часть данных отсутствует',
    code: EAPIRoomNotifsCode.NotFound,
    _service: {
      originalBody: req.body,
    },
  })
  
  if (roomNotifsStruct.tsUpdate === clientTsUpdate) return res.status(200).send({
    ok: false,
    message: 'Изменений еще не было',
    // state: roomNotifsStruct.data,
    code: EAPIRoomNotifsCode.NoUpdates,
    _service: {
      originalBody: req.body,
    },
  })

  return res.status(200).send({
    ok: true,
    code: EAPIRoomNotifsCode.Updated,
    message: 'Есть обновления...',
    state: roomNotifsStruct.data,
    tsUpdate: roomNotifsStruct.tsUpdate,
    _service: {
      originalBody: req.body,
    },
  })
}
