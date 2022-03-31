/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
const Imei = require('node-imei')

const IMEI = new Imei()
// const { getRandomInteger } = require('utils/getRandomInteger')

const toClient = [
  {
    success: false,
  },
  {
    success: true,
  },
]

module.exports = async (req, res) => {
  res.append('Content-Type', 'application/json')

  let response
  const toBeOrNotToBe = !!req.query.vendor && !!req.query.model

  if (!toBeOrNotToBe) {
    response = toClient[0]
    response.message = 'req.query.vendor or req.query.model is not found'
  } else {
    try {
      const { vendor, model } = req.query

      // TODO: Uppercase first char...

      response = toClient[1]
      response.result = IMEI.device(vendor, model)
    } catch (err) {
      response = toClient[0]
      if (typeof err === 'string') {
        response.message = err
      } else {
        response.message = err.message || 'No msg'
      }
    }
  }
  response._originalQuery = req.query

  res.status(toBeOrNotToBe ? 200 : 400).send(response)
}
