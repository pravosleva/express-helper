const jwt = require('jsonwebtoken')

module.exports = (jwtSecret, cookieName) => (req, res, next) => {
  // console.log(req.cookies)
  /*
   * Check if authorization header is set
   */
  // if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')) {
  if (!!req.cookies && !!req.cookies[cookieName]) {
    try {
      /*
       * Try to decode & verify the JWT token
       * The token contains user's id ( it can contain more informations )
       * and this is saved in req.user object
       */
      req.user = jwt.verify(req.cookies[cookieName], jwtSecret)
      return next()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      /*
       * If the authorization header is corrupted, it throws exception
       * So return 401 status code with JSON error message
       */
      return res.status(401).json({
        message: 'Ошибка аутентификации #1',
        code: `Failed to authenticate token: ${err.message || 'No err.message'}`,
      })
    }
  } else {
    /*
     * If there is no autorization header, return 403 status code with JSON
     * error message
     */
    return res
      .status(403)
      .json({ message: 'Ошибка аутентификации #2', code: `Forbidden: No token in cookies['${cookieName}']` })
    // res.redirect('/auth/signin')
  }
}
