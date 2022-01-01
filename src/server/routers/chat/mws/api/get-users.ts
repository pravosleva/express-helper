import {
  // registeredUsersMapInstance,
  registeredTGChatIdsMapInstance,
} from '~/utils/socket/state' 

export const getUsers = (req, res) => {
  // const { registry_level } = req.query

  // if (!registry_level) {
  //   return res.status(400).send({
  //     ok: false,
  //     message: 'Query params ERR: registry_level required',
  //     _originalQuery: req.query,
  //   })
  // }

  // const registeredUserData = registeredUsersMapInstance.get(username)
  try {
    const state = registeredTGChatIdsMapInstance.getState()
    const size = {
      registeredLevel2: registeredTGChatIdsMapInstance.size
    }

    return res.status(200).send({
      ok: true,
      state,
      size,
      _originalBody: req.body,
    })
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: err.message,
      _originalBody: req.body,
    })
  }
}
