const getReadableCamelCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2') // /([a-z0-9])([A-Z])/ for numbers counting as lowercase characters
}

class UniversalError extends Error {
  constructor(name) {
    super()
    this.name = name

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UniversalError.prototype)
  }

  getReadableCamelCase(str) {
    return getReadableCamelCase(str)
  }

  get nameAsReadableCamelCase() {
    return this.getReadableCamelCase(this.name)
  }

  getErrorMsg() {
    throw new Error('gerErrorMsg method should be implemented')
  }
}

module.exports = {
  UniversalError,
}
