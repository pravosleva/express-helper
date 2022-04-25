const { getRandomInteger } = require('../../../../../../utils/getRandomInteger')

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    message: 'Test',
  },
  {
    ok: true,
    price: 200,
    price_rub: 200,
    subsidies: [
      {
        baseDiscount: 1400,
        model: 'Apple iPhone SE 2020 128Gb',
      },
      {
        baseDiscount: 1000,
        model: 'Samsung Galaxy A12',
      },
    ],
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
