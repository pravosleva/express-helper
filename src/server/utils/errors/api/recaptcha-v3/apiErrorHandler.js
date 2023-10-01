const { ApiError } = require('../ApiError')

/*
{
  "success": true|false,      // whether this request was a valid reCAPTCHA token for your site
  "score": number             // the score for this request (0.0 - 1.0)
  "action": string            // the action name for this request (important to verify)
  "challenge_ts": timestamp,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  "hostname": string,         // the hostname of the site where the reCAPTCHA was solved
  "error-codes": [...]        // optional
}
*/

const apiErrorHandler = (res) => {
  if (res.success) return res

  const errors = {}

  ;['score', 'action', 'challenge_ts', 'hostname', 'error-codes'].forEach((key) => {
    if (res[key]) errors[key] = res[key]
  })

  if (Object.keys(errors).length === 0) {
    errors.noKeys = 'Ошибки не получены от апи гугла'
  }

  throw new ApiError(errors)
}

module.exports = {
  apiErrorHandler,
}
