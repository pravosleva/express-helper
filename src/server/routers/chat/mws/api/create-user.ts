import { registeredUsersMapInstance, ERegistryLevel, TRegistryData } from '~/utils/socket/state' 
import bcrypt from 'bcryptjs'
import { getRandomInteger } from '~/utils/getRandomInteger'


export const createUser = (req, res) => {
  const { chatId, username } = req.body

  if (!chatId || !username) {
    return res.status(400).send({
      ok: false,
      message: 'Params ERR: chatId, username are required',
      _originalBody: req.body,
    })
  }

  const registeredUserData = registeredUsersMapInstance.get(username)

  if (
    !!registeredUserData
    // && username !== 'pravosleva'
  ) {
    return res.status(200).send({
      ok: false,
      message: `Пользователь ${username} уже существует.\n\nОпции в разработке:\n- Восстановление пароля\n- Удаление пользователя`,
      _originalBody: req.body,
    })
  } else {
    const simplePasswd = getRandomInteger(1000, 9999)
    const passwordHash = bcrypt.hashSync(String(simplePasswd))

    // -- NOTE: tmp
    // let oldTokens
    // if (!!registeredUserData?.tokens && registeredUserData.tokens.length > 0) oldTokens = registeredUserData.tokens
    // --
    
    const newData: TRegistryData = {
      registryLevel: ERegistryLevel.TGUser,
      passwordHash,
      tg: {
        username,
        chat_id: chatId,
      }
    }
    // if (!!oldTokens) newData.tokens = oldTokens

    registeredUsersMapInstance.set(username, newData)

    return res.status(200).send({
      ok: true,
      password: simplePasswd,
      message: 'Храним только хэш пароля. Опция сброса пароля в разработке...', // NOTE: Если не передать, от бота придет Пароль можно поменять в ЛК
      _originalBody: req.body,
    })
  }

}