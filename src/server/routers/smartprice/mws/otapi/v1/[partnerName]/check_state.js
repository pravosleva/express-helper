const { getRandomInteger } = require('../../../../../../utils/getRandomInteger')

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    message: 'Test',
  },
  {
    ok: true,
    devices: {
      '777': {
        state: 'ok',
        condition_limit: 'works',
        condition_limit_reason: 'case_defects',
        price: 1909,
        price_rub: 1909,
        accepted_photos: 3,
        need_to_send_photos: 5,
      },
    },
  },
]

module.exports = async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
