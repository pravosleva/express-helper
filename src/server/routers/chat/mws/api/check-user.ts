import {
  registeredUsersMapInstance,
  // ERegistryLevel,
  // TRegistryData,
  registeredTGChatIdsMapInstance,
} from '~/utils/socket/state' 
// import bcrypt from 'bcryptjs'
// import { getRandomInteger } from '~/utils/getRandomInteger'
import { EAPICode } from './types'

export const checkUser = (req, res) => {
  const { chatId, username } = req.body

  if (!chatId || !username) {
    return res.status(400).send({
      ok: false,
      message: 'Params ERR: chatId, username are required',
      code: EAPICode.IncorrecrParams,
      _originalBody: req.body,
    })
  }

  const registeredUserData = registeredUsersMapInstance.get(username)
  const registeredTGChatIdUsername = registeredTGChatIdsMapInstance.get(String(chatId))

  if (!!registeredUserData) {
    // Мы его хоть раз видели?
    if (!!registeredTGChatIdUsername) {
      // Мы регили его из телеги?
      if (registeredTGChatIdUsername === username) {
        // Актуальный ник?
        return res.status(200).send({
          ok: true,
          code: EAPICode.UserExists,
          _originalBody: req.body,
        })
      } else {
        return res.status(200).send({
          ok: true,
          code: EAPICode.IncorrectUserName,
          oldUsername: registeredTGChatIdUsername,
          _originalBody: req.body,
        })
      }
    } else {
      return res.status(200).send({
        ok: true,
        code: EAPICode.NotFound,
        _originalBody: req.body,
      })
    }
  } else {
    return res.status(200).send({
      ok: true,
      code: EAPICode.NotFound,
      _originalBody: req.body,
    })
  }
}