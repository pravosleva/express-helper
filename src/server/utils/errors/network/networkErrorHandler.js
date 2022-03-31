const { NetworkError } = require('./NetworkError')

export const networkErrorHandler = (res) => {
  if (res.status) {
    return res
  }
  throw new NetworkError()
}
