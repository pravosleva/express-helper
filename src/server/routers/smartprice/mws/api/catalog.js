const { getRandomInteger } = require('../../../../utils/getRandomInteger')

module.exports = async (_req, res) => {
  res.status(200).send(String(getRandomInteger(500, 600)))
  // res.status(200).send('0')
}
