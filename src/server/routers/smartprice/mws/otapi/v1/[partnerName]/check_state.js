/* eslint-disable camelcase */
import { getRandomInteger } from '~/utils/getRandomInteger'

const { SUCCESS_ANYWAY } = process.env

// const isEven = (n) => !(n % 2)

// --- Counter
function* Counter(initVal = 0) {
  let count = initVal
  while (true) yield count++
}
const counter = Counter(1)

// Usage: counter.next().value
// ---

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
        // accepted_photos: 3,
        // need_to_send_photos: 5,
      },
    },
  },
  {
    ok: true,
    devices: {
      '777': {
        state: 'bad_quality',
        state_reason: 'imei',
        bad_types: ['front'],
      },
    },
  },
]

export default async (req, res) => {
  const { odd_success } = req.query
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)
  // const toBeOrNotToBe = !isEven(count) ? 2 : 1

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
    }, 1000)
  }
}
