const { getRandomInteger } = require('~/utils/getRandomInteger')

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

module.exports = async (req, res) => {
  const count = counter.next().value

  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)
  // const toBeOrNotToBe = !isEven(count) ? 2 : 1

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
      _service: {
        count,
      },
    })
  }, 500)
}
