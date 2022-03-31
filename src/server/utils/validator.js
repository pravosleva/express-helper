module.exports = {
  validURL(str) {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ) // fragment locator
    return !!pattern.test(str)
  },
  hasProtocol(str) {
    const pattern = new RegExp('https?:\\/\\/')

    return !!pattern.test(str)
  },
  hasWWW(str) {
    const pattern = new RegExp(/www./)

    return !!pattern.test(str)
  },
  isValidJsonString(str) {
    try {
      JSON.parse(str)
    } catch (_err) {
      return false
    }
    return true
  },
}
