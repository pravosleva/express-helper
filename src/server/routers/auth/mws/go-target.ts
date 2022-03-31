import {
  Response as IResponse,
  // NextFunction as INext,
} from 'express'
import { ICustomRequest } from '../../../utils/interfaces'
import jwt from 'jsonwebtoken'
import { hashedRedirectMap } from '../cfg'
import buildUrl from 'build-url'

// const getMsByDays = (days: number): number => 1000 * 60 * 60 * 24 * days
// const getMsByHours = (hours: number): number => 1000 * 60 * 60 * hours
const getMsByMinutes = (minutes: number): number => 1000 * 60 * minutes

export const goTarget = (expiresCookiesTimeInDays: number) => async (req: ICustomRequest, res: IResponse, next: any) => {
  if (!req.query.logged_req_id || typeof req.query.logged_req_id !== 'string')
    return res
      .status(401)
      .json({ message: 'Нехрен сюда лезть без правильных параметров', code: `typeof req.query.logged_req_id is ${typeof req.query.logged_req_id}` })
  
  const { hash } = req.query
  if (!hash) return res
    .status(401)
    .json({ message: 'Что-то пошло не так', code: `req.query.hash is ${typeof hash}` })

  const loggedReqId = req.query.logged_req_id
  const hasLoggedReqIdInState = req.loggedMap.state.has(loggedReqId)
  const maxAge = getMsByMinutes(0.25) // 10 sec

  try {
    const loggedObj = req.loggedMap.state.get(loggedReqId)
    
    if (!hashedRedirectMap.has(hash))
      throw new Error('Многое поменялось пока Вы спали: !hashedRedirectMap.has(hash); Скорее всего, поменялся jwt secret')

    // 1. Find cfg target item by hash
    let targetCfgItem = null
    let targetCode = null

    targetCfgItem = hashedRedirectMap.get(hash)
    if (!targetCfgItem)
      throw new Error('Developers fuckup detected: Configuration error; target cfg item not found')

    targetCode = targetCfgItem.code
    if (!targetCode)
      throw new Error('Developers fuckup detected: Configuration error; targetCfgItem.code not found')

    if (!loggedObj) {
      res.clearCookie(targetCode)
      res.cookie('urgent_auth_service_msg', 'Нет такой сессии для аутентификации на доп устройствах: !loggedObj; Возможно, Вы исчерпали количество дополнительных устройств для аутентификации', { maxAge, httpOnly: false })
      res.redirect(buildUrl(targetCfgItem.unlogged, {
        queryParams: { hash },
      }))
    }

    const { success_url } = loggedObj

    if (!hasLoggedReqIdInState) {
      // TODO?: res.clearCookie(cookieName)
      // throw new Error('Нет такой сессии для аутентификации на доп устройствах: !hasLoggedReqIdInState; Возможно, Вы исчерпали количество дополнительных устройств для аутентификации')

      // return res.status(200).redirect(fail_url)
      // return res.status(500).json({ ok: false, mesage: 'TODO' })
      // V2:
      res.cookie('urgent_auth_service_msg', 'Нет такой сессии для аутентификации на доп устройствах: !hasLoggedReqIdInState; Возможно, Вы исчерпали количество дополнительных устройств для аутентификации', { maxAge, httpOnly: false })
      res.redirect(buildUrl(targetCfgItem.unlogged, {
        queryParams: {
          hash: targetCfgItem.hash
        },
      }))
    }

    // --- NOTE: Set cookie before redirect
    const jwt4Cookie = jwt.sign({ id: 1 }, targetCfgItem.jwtSecret, {
      expiresIn: 60 * 60 * 24 * expiresCookiesTimeInDays,
    })
    res.cookie(targetCode, jwt4Cookie, { maxAge, httpOnly: true })
    // ---

    await req.loggedMap.addLoggedSessionOrDelete(loggedReqId)
      .then((msg) => {
        // res.cookie('auth_service_msg', msg, { maxAge, httpOnly: false })
        res.status(200).redirect(success_url)
      })
      .catch((msg) => {
        // res.cookie('auth_service_msg', msg, { maxAge, httpOnly: false })

        // TODO?: redirect to error page

        // V1:
        // res.status(500).json({ ok: false, message: msg })

        // V2:
        // Go to err page?

        // V3:
        res.clearCookie(targetCode)
        res.redirect(buildUrl(targetCfgItem.unlogged, {
          queryParams: {
            hash: targetCfgItem.hash
          },
        }))

        // V4:
        // NOTE: Если страница требует авторизации, пользователь все равно будет переброшен на страницу авторизации
        // res.status(200).redirect(success_url)
      })
  } catch (err) {
    // TODO?: May be remove cookie and go fail_url? #ERRPAGE

    return res.status(500).json({
      // NOTE: For example: 
      _originalReqQuery: req.query,
      _express: {
        loggedSize: req.loggedMap.state.size,
      },
      ok: false,
      message: typeof err === 'string' ? err : err?.message || 'No err.message',
    })
  }
}
