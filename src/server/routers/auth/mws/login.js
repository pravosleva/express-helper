/* eslint-disable no-restricted-syntax */

import buildUrl from 'build-url'
import { getMsByDays } from '~/utils/auth/getMsByDays'

const jwt = require('jsonwebtoken')
const { redirect: cfg, hashedRedirectMap } = require('../cfg')

module.exports = (expiresCookiesTimeInDays) =>
  async function (req, res) {
    // res.clearCookie('urgent_auth_service_msg')
    if (!req.body.hash) {
      return res
        .status(401)
        .json({ message: 'Нехрен сюда лезть без хэша', code: '#02 req.body.hash should be transfered!' })
    }
    /*
     * Check if the password is correct
     */
    // 1. Find cfg target item by hash
    let targetCfgItem = null
    let targetCode = null
    const { hash } = req.body
    if (hashedRedirectMap.has(hash)) {
      targetCfgItem = hashedRedirectMap.get(hash)
      targetCode = targetCfgItem.code
    }
    if (!targetCfgItem || !targetCode)
      return res
        .status(401)
        .json({ message: 'Нехрен сюда лезть без правильного хэша', code: '#03 target cfg item not found' })

    // 2. Auth by passwd
    if (!targetCfgItem.accessPassword) {
      return res.status(500).json({
        message: 'Ошибка авторизации #04: Возможно, на бэке что-то забыли указать',
        code: '#04 Check cfg: !targetCfgItem.accessPassword is true',
      })
    }
    if (req.body.password === targetCfgItem.accessPassword) {
      const jwt4Cookie = jwt.sign({ id: 1 }, targetCfgItem.jwtSecret, {
        expiresIn: 60 * 60 * 24 * expiresCookiesTimeInDays,
      })
      const maxAge = getMsByDays(expiresCookiesTimeInDays)

      // 3. Set cookie
      res.cookie(targetCode, jwt4Cookie, { maxAge, httpOnly: true })

      // --- QR CODE: 3.1
      const qrInfoUrl = buildUrl(targetCfgItem.qr.targetUrl, {
        queryParams: {
          logged_req_id: req.id,
          hash,
          // bar: ['one', 'two', 'three']
        },
      })

      const qr = await req.loggedMap.addExistsSession({
        reqId: req.id,
        infoUrl: qrInfoUrl,
        hash: req.body.hash,
        success_url: buildUrl(
          targetCfgItem.logged
          // { queryParams: {
          //   logged_req_id: req.id,
          //   hash: targetCfgItem.hash, }}
        ),
        fail_url: buildUrl(
          targetCfgItem.unlogged
          // { queryParams: {
          //   hash: targetCfgItem.hash, }},
        ),
      })
      // ---

      return res.json({
        id: 1,
        jwt: jwt4Cookie,
        redirect: cfg[targetCode].logged,
        uiName: cfg[targetCode].uiName || 'Noname',
        message: 'Logged, use QR',
        qr,
        _express: {
          totalLogged: req.loggedMap.state.size,
        },
      })
    }
    /*
     * If the username or password was wrong, return 401 ( Unauthorized )
     * status code and JSON error message
     */
    return res.status(401).json({ message: 'Wrong username or password!' })
  }
