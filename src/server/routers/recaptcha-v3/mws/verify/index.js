const axios = require('axios')
const { httpErrorHandler } = require('../../../../utils/errors/http/axios/httpErrorHandler')
const { apiErrorHandler } = require('../../../../utils/errors/api/recaptcha-v3/apiErrorHandler')
const { universalAxiosCatch } = require('../../../../utils/errors/universalCatch')

const { RECAPTCHAV3_SERVER_KEY } = process.env
const { RECAPTCHAV3_VERIFY_URL } = process.env

module.exports = async (req, res) => {
  if (!req.body.captcha) {
    res.status(400).send({
      ok: false,
      message: 'Captcha token is undefined',

      captcha: req.body.captcha,
      errors: {
        requestError: ['Captcha token is undefined'],
      },
    })
  }

  const byGoogle = await axios
    .post(`${RECAPTCHAV3_VERIFY_URL}?secret=${RECAPTCHAV3_SERVER_KEY}&response=${req.body.captcha}`)
    .then(httpErrorHandler)
    .then(apiErrorHandler)
    .then((data) => ({
      isOk: true,
      response: data,
    }))
    .catch(universalAxiosCatch)

  if (byGoogle.isOk) {
    if (byGoogle.response.success) {
      res.status(200).send({
        ok: true,
        original: byGoogle.response,
      })
    } else {
      res.status(500).send({
        ok: false,
        message: 'Неожиданная ошибка на стороне Гугла: !byGoogle.response.success',

        captcha: req.body.captcha,
        original: byGoogle.response,

        errors: {
          '!byGoogle.response.success': ['Неожиданная ошибка на стороне Гугла'],
        },
      })
    }
  } else {
    res.status(500).send({
      ok: false,
      message: `Обработанная ошибка !byGoogle.isOk: ${byGoogle.msg}`,

      captcha: req.body.captcha,
      errors: {
        '!byGoogle.isOk': [byGoogle.msg],
      },
    })
  }
}
