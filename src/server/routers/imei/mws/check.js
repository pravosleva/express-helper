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
  const toBeOrNotToBe = !!req.query.imei

  if (!toBeOrNotToBe) {
    response = toClient[0]
    response.message = 'req.query.imei is not found'
  } else {
    const { imei } = req.query

    response = toClient[1]
    response.result = IMEI.isValid(imei)
  }
  response._originalQuery = req.query

  res.status(toBeOrNotToBe ? 200 : 400).send(response)
}
