/* eslint-disable no-console */
const jwt = require('jsonwebtoken')
const { getConfigurableUrl } = require('../../../utils/string-ops/getConfigurableUrl')

const { redirect } = require('../cfg')

export const redirectIfLoggedMw = (jwtSecret, cookieName) => (req, res, next) => {
  // --- NOTE: REDIRECT LOGGED CLIENT who has permission to work with the current agent
  // 1) Проерим, есть ли кука
  if (!!req.cookies && !!req.cookies[cookieName]) {
    // -- 2) Если есть хэш в запросе, проверим, соотносится ли он со стандартным хэшом на сервере
    if (req.query.hash) {
      if (req.query.hash === redirect[cookieName].hash) {
        // - 2.1) Верифицируем клиента по его куке (как имеющего доступ к текущему контрагенту)
        /*
         * Try to decode & verify the JWT token
         * The token contains user's id ( it can contain more informations )
         * and this is saved in req.user object
         */
        try {
          req.user = jwt.verify(req.cookies[cookieName], jwtSecret)
          if (req.user.id) {
            // return res.redirect(redirect[cookieName].logged)
            return res.redirect(
              getConfigurableUrl({
                baseUrl: '',
                relativePath: redirect[cookieName].logged,
                query: {
                  from: typeof req.query.from !== 'undefined' ? req.query.from : undefined,
                },
              })
            )
          }
        } catch (err) {
          // NOTE: For example, JsonWebTokenError: invalid signature
          console.log('err #riu1')
          console.log(err)
        }

        // -
      }
    }
    // --
  }
  // ---

  return next()
}
