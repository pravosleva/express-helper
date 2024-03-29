import {
  registeredUsersMapInstance,
  ERegistryLevel,
  TRegistryData,
  registeredTGChatIdsMapInstance,
} from '~/utils/socket/state' 
import bcrypt from 'bcryptjs'
import { getRandomInteger } from '~/utils/getRandomInteger'
import { EAPIUserCode } from './types'

export const createUser = (req, res) => {
  const { chatId, username } = req.body

  if (!chatId || !username) {
    return res.status(400).send({
      ok: false,
      message: 'Params ERR: chatId, username are required',
      code: EAPIUserCode.IncorrecrParams,
      _originalBody: req.body,
    })
  }

  const oldTGChatIdData = registeredTGChatIdsMapInstance.get(String(chatId))

  switch (true) {
    case !!oldTGChatIdData:
      // 1.1 NOTE: Пользователь поменял ник?
      // --
      // TODO: Проверить, нет ли его в blacklist -> Если есть отклонить: return res.status(200).send({ ok: false, message: 'Вы забанены' })
      // --
    default:
      // 2. NOTE: Пользователя еще не было
      const simplePasswd = getRandomInteger(1000, 9999)
      const passwordHash = bcrypt.hashSync(String(simplePasswd))

      const newData: TRegistryData = {
        registryLevel: ERegistryLevel.TGUser,
        passwordHash,
        tg: {
          username,
          chat_id: chatId,
        }
      }

      registeredUsersMapInstance.set(username, newData)
      registeredTGChatIdsMapInstance.set(String(chatId), username)

      let messages = ['- Храним только хэш пароля']
      let code = EAPIUserCode.Created
      if(!!oldTGChatIdData) {
        messages.push(`- Вы ранее были под ником ${oldTGChatIdData}; Имя перезаписано на ${username}`)
        code = EAPIUserCode.Updated
      }
      messages.push('- Опция сброса пароля в разработке...')

      return res.status(200).send({
        ok: true,
        password: simplePasswd,
        message: messages.join('\n'), // NOTE: Если не передать, от бота придет "Пароль можно поменять в ЛК"
        code,
        _originalBody: req.body,
      })
  }
}
