const { getRandomInteger } = require('../../../../../../utils/getRandomInteger')

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    message: 'Test',
  },
  {
    ok: true,
    _testField: {
      fromStepName: 'accept_price',
    },
  },
]

module.exports = async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : getRandomInteger(0, 1)

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
