import { roomsMapInstance } from '~/utils/socket/state'
import { EAPIRoomCode } from './types'

export const checkRoom = (req, res) => {
  const { room_id } = req.body

  if (!room_id) {
    return res.status(400).send({
      ok: false,
      message: 'Params ERR: room_id is required',
      code: EAPIRoomCode.IncorrecrParams,
      _originalBody: req.body,
    })
  }

  const isRoomExists = roomsMapInstance.has(room_id)

  if (isRoomExists) {
    return res.status(200).send({
      ok: true,
      code: EAPIRoomCode.RoomExists,
      link: `https://pravosleva.pro/express-helper/chat/#/chat?room=${room_id}`,
      _originalBody: req.body,
    })
  } else {
    return res.status(200).send({
      ok: true,
      code: EAPIRoomCode.NotFound,
      _originalBody: req.body,
    })
  }
}
