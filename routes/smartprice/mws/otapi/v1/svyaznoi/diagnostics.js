const { getRandomInteger } = require('utils/getRandomInteger')

const toClient = [
  {
    ok: false,
    message: 'Test',
  },
  {
    ok: true,
    price: 200,
    price_rub: 200,
  },
]

module.exports = async (req, res) => {
  const toBeOrNotToBe = getRandomInteger(0, 1)

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
