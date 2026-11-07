import { getMsByDays } from '~/utils/auth/getMsByDays'
// import buildUrl from 'build-url'
import { getConfigurableUrl } from '../../../utils/string-ops/getConfigurableUrl'

const jwt = require('jsonwebtoken')
const { redirect: cfg, hashedRedirectMap } = require('../cfg')

export const login = (expiresCookiesTimeInDays) =>
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
    const { hash, decodedFrom } = req.body
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
      const qrInfoUrl = getConfigurableUrl({
        baseUrl: targetCfgItem.qr.targetUrl,
        relativePath: '',
        query: {
          logged_req_id: req.id,
          hash,
          from: !!decodedFrom ? encodeURIComponent(decodedFrom) : undefined,
        },
      })
      const protocol = req.protocol
      const host = req.get('host')
      const fullBaseUrl = `${protocol}://${host}`
      const qr = await req.loggedMap.addExistsSession({
        reqId: req.id,
        infoUrl: qrInfoUrl, // NOTE: This is qr payload
        hash: req.body.hash,
        // success_url: !!decodedFrom ? decodedFrom : targetCfgItem.logged,
        success_url: targetCfgItem.logged, // NOTE: This is siccess redirect way if _
        fail_url: getConfigurableUrl({
          baseUrl: '',
          relativePath: targetCfgItem.unlogged,
          query: {
            from: !!decodedFrom ? encodeURIComponent(decodedFrom) : undefined,
          }
        }),
      })
      // - NOTE: How does it work?
      //               | <--- targetCfgItem.qr.targetUrl - base url --------> |
      // 1. Scan QR -> ${BASE_PROTOCOL_HOST}${EXTERNAL_ROUTING}/auth/go-target?hash=&logged_req_id=
      // -> /auth/go-target:
      // _. !!hash && !!hashedRedirectMap.has(hash) -> Find cfg target item by hash
      // _. !!req.loggedMap.state.get(loggedReqId)
      // _. const { success_url } = loggedObj
      // 2. Set cookie before redirect
      // 3. loggedMap.addLoggedSessionOrDelete()
      // 4. Redirect to req.query.from || success_url
      // -
      // ---

      return res.json({
        id: 1,
        jwt: jwt4Cookie,
        redirect: !!decodedFrom
          ? decodedFrom
          : cfg[targetCode].logged,
        uiName: !!decodedFrom
          ? decodedFrom
          : (cfg[targetCode].uiName || 'Noname'),
        message: 'U\'re logged, use QR',
        qr,
        _express: {
          targetCode,
          decodedFrom,
          'redirect -> cfg[targetCode].logged': cfg[targetCode].logged,
          'uiName -> cfg[targetCode].uiName': cfg[targetCode].uiName,
          totalLogged: req.loggedMap.state.size,
          'req.body.decodedFrom': decodedFrom,
          'targetCfgItem.logged': targetCfgItem.logged,
          fullBaseUrl,
        },
      })
    }
    /*
     * If the username or password was wrong, return 401 ( Unauthorized )
     * status code and JSON error message
     */
    return res.status(401).json({ message: 'Wrong username or password!' })
  }
