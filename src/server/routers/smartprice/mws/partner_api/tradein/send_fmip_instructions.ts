import { getRandomInteger } from '~/utils/getRandomInteger'

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    message: 'Test',
  },
  {
    ok: true,
  },
]

export const sendFmipInstructions = async (req, res) => {
  /* REQ SAMPLE:
  { "phone": "79031231212" } */
  const requiredFields = ['phone']
  const errs = []

  for (const key of requiredFields) if (!req.body[key]) errs.push(`${key} is required!`)

  if (errs.length > 0) {
    return res.status(200).send({
      ok: false,
      message: errs.join('; '),
      _originalBody: req.body,
    })
  }

  const toBeOrNotToBe = 0 // SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  return setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
