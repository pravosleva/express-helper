const { UniversalError } = require('../UniversalError')

class ApiError extends UniversalError {
  constructor(errors) {
    super('ApiError')

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  getErrorMsg() {
    const normalizedName = this.getReadableCamelCase(this.name)
    let errorsStr = ''

    if (!!this.errors && Object.keys(this.errors).length > 0) {
      Object.keys(this.errors).forEach((e) => {
        if (Array.isArray(this.errors[e])) {
          this.errors[e].forEach((str) => {
            errorsStr += `, ${str}`
          })
        }
      })
    } else {
      errorsStr = ', Ошибки не получены с бэка'
    }

    return normalizedName.concat(': ', errorsStr.slice(2))
  }
}

module.exports = {
  ApiError,
}
