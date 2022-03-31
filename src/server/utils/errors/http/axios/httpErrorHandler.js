const { HttpError } = require('../HttpError')

const httpErrorHandler = (obj) => {
  if (obj.status === 200) {
    return obj.data
  }
  throw new HttpError(obj.request.status, obj.request.statusText)
}

module.exports = {
  httpErrorHandler,
}
