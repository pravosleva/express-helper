/* eslint-disable no-console */
// const md5 = require('md5.js')
// const { getRandomInteger } = require('utils/getRandomInteger')
// const md5Hash = require('md5-hash')
const md5Hash = require('../../../../../utils/md5')

module.exports = async (req, res) => {
  // console.log(req.query.hash)

  // SAMPLE: http://localhost:5000/smartprice/md5/make?key=abcd&svar=42&t=1496275200

  const { key, svar, t } = req.query
  const result = {
    ok: false,
  }
  let status = 500

  if (!!key && !!svar && !!t) {
    result.value = md5Hash(key + svar + t)
    result.ok = true
    status = 200
  } else {
    result.message = 'Required query fields: key, svar, t'
    result.sample = '/smartprice/md5/make?key=abcd&svar=42&t=1496275200'
  }

  res.status(status).send(result)
}
