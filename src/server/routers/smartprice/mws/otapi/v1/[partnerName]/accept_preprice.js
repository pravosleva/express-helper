/* eslint-disable camelcase */
import { getRandomInteger } from '~/utils/getRandomInteger'
import { Counter } from '~/utils/Counter'

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    code: 'access_denied',
    message: 'Недопустимая операция',
    extra: null,
  },
  {
    ok: true,
    need_photos: ['back', 'front', 'screen_off', 'burnouts'],
    _testField: {
      fromStepName: 'accept_preprice',
    },
    subsidies: [
      {
        baseDiscount: 1300,
        model: 'Apple iPhone SE 2020 128Gb',
      },
      {
        baseDiscount: 900,
        model: 'Samsung Galaxy A12',
      },
    ],
  },
]

const counter = Counter()

export default async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : getRandomInteger(0, 1)
  const { odd_success } = req.query

  if (odd_success) {
    const count = counter.next().value
    const isSuccess = count % odd_success === 0
    const message = `Остаток [${count} от ${odd_success} (${typeof odd_success})]: ${count % odd_success}`

    setTimeout(() => {
      res.status(isSuccess ? 200 : 500).send({
        ...toClient[Number(isSuccess)],
        message,
        _originalBody: req.body,
        _originalQuery: req.query,
      })
    }, 500)
  } else {
    setTimeout(() => {
      res.status(200).send({
        ...toClient[toBeOrNotToBe],
        _originalBody: req.body,
      })
    }, 500)
  }
}
