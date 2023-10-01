const { UniversalError } = require('../UniversalError')

export class ApiError extends UniversalError {
  constructor(error) {
    super('ApiError')
    this.error = error

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  getErrorMsg() {
    const normalizedName = this.getReadableCamelCase(this.name)
    // NOTE: v1
    // let errorsStr = ''
    // if (!!this.errors && Object.keys(this.errors).length > 0) {
    //   Object.keys(this.errors).forEach((e: string) => {
    //     // @ts-ignore
    //     if (!!this.errors && Array.isArray(this.errors[e])) {
    //       // @ts-ignore
    //       this.errors[e].forEach((str: string) => {
    //         errorsStr += `, ${str}`
    //       })
    //     }
    //   })
    // } else {
    //   errorsStr = ', Ошибки не получены с бэка'
    // }
    // return normalizedName.concat(': ', errorsStr.slice(2))

    // NOTE: v2
    return normalizedName.concat(': ', JSON.stringify(this.error))
  }
}

module.exports = {
  ApiError,
}
