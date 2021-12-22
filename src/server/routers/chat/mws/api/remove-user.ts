import {
  registeredUsersMapInstance,
  // ERegistryLevel,
  // TRegistryData,
  registeredTGChatIdsMapInstance,
} from '~/utils/socket/state' 
// import bcrypt from 'bcryptjs'
// import { getRandomInteger } from '~/utils/getRandomInteger'
import { EAPIUserCode } from './types'

export const removeUser = (req, res) => {
  const { chatId, username } = req.query

  if (!chatId || !username) {
    return res.status(400).send({
      ok: false,
      message: 'Params ERR: chatId, username are required',
      code: EAPIUserCode.IncorrecrParams,
      _originalQuery: req.query,
    })
  }

  const registeredUserData = registeredUsersMapInstance.get(username)

  if (!registeredUserData) {
    return res.status(400).send({
      ok: true,
      message: 'User not found',
      code: EAPIUserCode.NotFound,
      _originalQuery: req.query,
    })
  } else {
    const registeredTGChatIdUsername = registeredTGChatIdsMapInstance.get(String(chatId))

    if (!!registeredTGChatIdUsername) {
      if (registeredTGChatIdUsername === username) {
        try {
          registeredUsersMapInstance.delete(username)
          registeredTGChatIdsMapInstance.delete(chatId)
          return res.status(200).send({
            ok: true,
            code: EAPIUserCode.Removed,
            oldUsername: registeredTGChatIdUsername,
            _originalQuery: req.query,
          })
        } catch (err) {
          return res.status(200).send({
            ok: true,
            code: EAPIUserCode.ServerError,
            message: err.message || 'No err.message',
            oldUsername: registeredTGChatIdUsername,
            _originalQuery: req.query,
          })
        }
        
      } else {
        return res.status(200).send({
          ok: false,
          code: EAPIUserCode.IncorrectUserName,
          oldUsername: registeredTGChatIdUsername,
          _originalQuery: req.query,
        })
      }
    } else {
      return res.status(400).send({
        ok: true,
        message: 'TG User not found',
        code: EAPIUserCode.NotFound,
        _originalQuery: req.query,
      })
    }
  }
}