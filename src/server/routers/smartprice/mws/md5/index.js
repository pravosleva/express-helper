/* eslint-disable no-console */
// const md5 = require('md5.js')
// const { getRandomInteger } = require('utils/getRandomInteger')
// const md5Hash = require('md5-hash')
const md5Hash = require('../../../../utils/md5')

module.exports = async (req, res) => {
  console.log(req)

  const testMD5 = md5Hash('abcd1231496275200')

  res.status(200).send({ x: 'tested', testMD5 })
}
