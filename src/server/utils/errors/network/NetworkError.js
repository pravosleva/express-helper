const { UniversalError } = require('../UniversalError')

class NetworkError extends UniversalError {
  constructor(message) {
    super('NetworkError')
    this.message = message

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NetworkError.prototype)
  }

  getErrorMsg() {
    return `${this.getReadableCamelCase(this.name)}${this.message ? `: ${this.message}` : ''}`
  }
}

module.exports = {
  NetworkError,
}
