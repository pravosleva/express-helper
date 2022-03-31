const { getRandomInteger } = require('../../../../utils/getRandomInteger')
// const getProbabilityRandom = require('utils/getProbabilityRandom')

const { SUCCESS_ANYWAY } = process.env

/* SAMPLE:
curl -X POST https://smartprice.ru/check-discount/ -H 'Content-Type: application/json' -d '{
    "promo": "spotysmart"
}'
*/
// probabilityRandom(40, 25, 35, ['Optionlist reset', 'Optionlist reset, we are working on it...', 'Optionlist reset, sorry'])

const toClient = [
  {
    exists: false,
  },
  {
    exists: true,
    rate: 0.88,
    pk: getRandomInteger(100, 999),
    restricted: false,
    valid_until: '2020-12-29T21:00:00Z',
  },
]

module.exports = async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)
  // const toBeOrNotToBe = getProbabilityRandom(2, 3, 95, [true, true, true])

  // res.status(500).send('In progress...')
  const result = toClient[toBeOrNotToBe]

  res.status(toBeOrNotToBe ? 200 : 400).send({
    ...result,
    _originalBody: req.body,
  })
}
