import jwt from 'jsonwebtoken'
import { getConfigurableUrl } from '~/utils/string-ops/getConfigurableUrl'

const { redirect } = require('../cfg')

const EXTERNAL_ROUTING = process.env.EXTERNAL_ROUTING || ''

export const redirectIfUnloggedMw = (jwtSecret, cookieName) => (req, res, next) => {
  try {
    // --- NOTE: REDIRECT UNLOGGED who has NOT permission to work with the current agent
    // 1) Проерим, есть ли конкретная кука в запросе
    if (!!req.cookies && !!req.cookies[cookieName]) {
      // -- 1.1) Verify user by cookie
      /*
       * Try to decode & verify the JWT token
       * The token contains user's id ( it can contain more informations )
       * and this is saved in req.user object
       */
      try {
        req.user = jwt.verify(req.cookies[cookieName], jwtSecret)
        if (req.user.id) return next()
      } catch (err) {
        // NOTE: For example, JsonWebTokenError: invalid signature
        res.clearCookie(cookieName)

        return res.status(200).redirect(
          getConfigurableUrl({
            baseUrl: '',
            relativePath: redirect[cookieName].unlogged,
            query: {
              hash: redirect[cookieName].hash,
              from: req.originalUrl ? encodeURIComponent(`${EXTERNAL_ROUTING}${req.originalUrl}`) : undefined,
            },
          })
        )
      }

      // -- 1.2) Or redirect
      // return res.redirect(`${redirect[cookieName].unlogged}?hash=${redirect[cookieName].hash}`)
      return res.redirect(
        getConfigurableUrl({
          baseUrl: '',
          relativePath: redirect[cookieName].unlogged,
          query: {
            hash: redirect[cookieName].hash,
            from: req.originalUrl ? encodeURIComponent(`${EXTERNAL_ROUTING}${req.originalUrl}`) : undefined,
          },
        })
      )
      // --
    }
    // 2) Нет конкретной куки в запросе (в этой миддлваре проверили только на конкретного контрагента)
    // return res.redirect(`${redirect[cookieName].unlogged}?hash=${redirect[cookieName].hash}`)
    return res.redirect(
      getConfigurableUrl({
        baseUrl: '',
        relativePath: redirect[cookieName].unlogged,
        query: {
          hash: redirect[cookieName].hash,
          from: req.originalUrl ? encodeURIComponent(`${EXTERNAL_ROUTING}${req.originalUrl}`) : undefined,
        },
      })
    )

    // ---
  } catch (err) {
    return res.status(500).json({
      message: 'Developers fuckup detected. Problem in redirect-if-unlogged mw',
      code: `You should be redirected. But !redirect[${cookieName}]. Check cfg! (redirect-if-unlogged mw)`,
    })
  }
}
