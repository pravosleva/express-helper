const { UniversalError } = require('../UniversalError')

class HttpError extends UniversalError {
  constructor(status, message) {
    super('HttpError')

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype)
  }

  getErrorMsg() {
    const normalizedName = this.getReadableCamelCase(this.name)

    return `${normalizedName} ${this.status}: ${this.message}`
  }
}

module.exports = {
  HttpError,
}
