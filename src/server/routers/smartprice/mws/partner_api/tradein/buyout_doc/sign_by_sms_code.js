import { getRandomInteger } from '~/utils/getRandomInteger'

// const SUCCESS_ANYWAY = process.env.SUCCESS_ANYWAY === '1'

const toClient = [
  {
    ok: false,
    code: 'bad_sms_code',
  },
  {
    ok: true,
  },
  {
    ok: false,
    code: 'cannot_do_payout',
    message: 'Hello from backend, try again.',
  },
]

export const signBySMSCode = (req, res) => {
  if (!req.body.id || !req.body.sms_code) {
    return res.status(200).send({
      ok: false,
      message: 'Required params: req.body.id, req.body.sms_code',
      _originalBody: req.body,
    })
  }

  // const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 2)
  const toBeOrNotToBe = 2

  return setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 3000)
}
