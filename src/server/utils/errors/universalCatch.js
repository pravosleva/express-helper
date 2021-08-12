// const { NetworkError } = require('utils/errors/network/NetworkError')
const { NetworkError } = require('./network/NetworkError')
const { HttpError } = require('./http/HttpError')
const { ApiError } = require('./api/ApiError')

module.exports = {
  universalAxiosCatch: (err) => {
    // eslint-disable-next-line no-console
    // console.log(err)
    switch (true) {
      case err.isAxiosError:
        try {
          if (err.response) {
            // Client received an error response (5xx, 4xx)
            throw new HttpError(err.response.status, err.response.statusText)
          } else if (err.request) {
            throw new NetworkError('ERR: Client never received a response, or request never left')
          } else {
            return {
              isOk: false,
              msg: 'AXIOS ERR: Не удалось обработать ошибку',
            }
          }
        } catch (error) {
          return {
            isOk: false,
            msg: error.getErrorMsg(),
          }
        }
      // NOTE 2
      // Доп. обрабочики (помимо apiErrorHandler) будут нужны,
      // если настройки options будут позволять провалиться дальше: axios по умолчанию все перехватит сам
      // (см. обработку выше)
      // case err instanceof NetworkError:
      case err instanceof HttpError:
      case err instanceof ApiError:
        // case Object.getPrototypeOf(err).name === 'Error':
        return {
          isOk: false,
          msg: err.getErrorMsg(),
        }
      case err instanceof TypeError: // CORS for example
        // case Object.getPrototypeOf(err).name === 'Error':
        return {
          isOk: false,
          msg: err.message,
        }
      default:
        return {
          isOk: false,
          msg: 'REQUEST ERR: Не удалось обработать ошибку',
        }
    }
  },
}
