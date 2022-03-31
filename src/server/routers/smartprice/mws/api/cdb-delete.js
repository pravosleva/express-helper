const { getRandomInteger } = require('../../../../utils/getRandomInteger')

const { SUCCESS_ANYWAY } = process.env

module.exports = async (_req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : getRandomInteger(0, 1)

  // res.status(200).send(String(getRandomInteger(500, 600)))
  // res.status(500).send('In progress...')
  res.status(toBeOrNotToBe ? 200 : 400).send({ ok: !!toBeOrNotToBe })
}
