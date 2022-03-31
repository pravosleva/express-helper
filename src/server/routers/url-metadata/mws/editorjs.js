const urlMetadata = require('url-metadata')
const { hasProtocol, hasWWW } = require('../../../utils/validator')

module.exports = async (req, res) => {
  if (!req.query || !req.query.url) {
    res.status(400).send({
      success: 0,
      error: {
        query: 'query.url is required',
      },
    })
  }
  const { url } = req.query
  let normalizedURL = url
  if (hasWWW(normalizedURL)) {
    normalizedURL = normalizedURL.replace('www.', '')
  }
  if (!hasProtocol(normalizedURL)) {
    normalizedURL = `http://${url}`
  }

  await urlMetadata(normalizedURL).then(
    function (metadata) {
      res.set('Content-Type', 'application/json')
      res.status(200).send({
        success: 1,
        meta: metadata,
      })
    },
    function (error) {
      res.status(500).send({
        success: 0,
        error,
      })
    }
  )
}
