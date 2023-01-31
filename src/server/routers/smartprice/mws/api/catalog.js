const { getRandomInteger } = require('../../../../utils/getRandomInteger')

module.exports = async (_req, res) => {
  res.status(200).send(String(getRandomInteger(1000, 10000)))
  // res.status(200).send('0')
}
