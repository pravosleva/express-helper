/* eslint-disable no-restricted-syntax */
// const { redirect } = require('../cfg')
import { redirect } from '~/routers/auth/cfg'

type TResponse = {
  message?: string
  code?: string
  _originalQuery: any
  ok: boolean
  accessCode?: any
  uiName?: string
}

const getAccessCodeByHash = (req, res) => {
  // res.append('Content-Type', 'application/json')

  const { hash } = req.query
  let status = 500
  const response: TResponse = {
    _originalQuery: req.query,
    ok: false,
  }

  if (!hash) {
    status = 401
    response.message = 'Ошибка параметров'
    response.code = 'Fuckup: !req.query.hash'
    return res.status(status).json(response)
  }

  // ---
  let targetAccessCode = null
  let targetUiName = null

  for (const key in redirect) {
    if (redirect[key].hash === hash) {
      targetAccessCode = key
      targetUiName = redirect[key].uiName
    }
  }

  if (targetAccessCode) {
    response.accessCode = targetAccessCode
    response.ok = true
    status = 200
    response.uiName = targetUiName || 'Noname'
    response.message = 'Контрагент найден'
  } else {
    response.accessCode = targetAccessCode
    response.message = 'Контрагент не найден'
  }
  // ---

  return res.status(status).json(response)
}

export default getAccessCodeByHash
