/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
// const Imei = require('node-imei')
// const IMEI_GenCheck = require('imei_gencheck')

// const imeigc = new IMEI_GenCheck()

// imeigc.loadDB()

// const IMEI = new Imei()
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
      // const { vendor, model } = req.query

      response = toClient[1]
      response._originalQuery = req.query
      // response.result = IMEI.device(vendor, model)

      /*

      const tacinfo = await imeigc.randomTACInfoWithNames(vendor, model).then((tacinfo) => {
        // This involves a search in DB (which i didn't optimize (yet?) at all), so it's async:
        // NOTE: imeigc.randomIMEIwithTAC(tacinfo.tac) // Should be 35381208xxxxxxx
        return tacinfo
      })

      response.imei_gencheck = tacinfo

      if (tacinfo) {
        response.imei_gencheck.randomIMEIwithTAC = imeigc.randomIMEIwithTAC(tacinfo.tac)
      }
      */

      response.success = false
      response.message = 'IN PROGRESS'

      return res.status(200).send(response)
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

  return res.status(toBeOrNotToBe ? 200 : 400).send(response)
}
