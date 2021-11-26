import { getRandomInteger } from '~/utils/getRandomInteger'

const SUCCESS_ANYWAY = process.env.SUCCESS_ANYWAY === '1'

const toClient = [
  {
    ok: false,
    code: 'bad_sms_code',
  },
  {
    ok: true,
  },
]

export const signBySMSCode = (req, res) => {
  if (!req.body.id || !req.body.sms_code) {
    return res.status(500).send({
      ok: false,
      message: 'Required params: req.body.id, req.body.sms_code',
      _originalBody: req.body,
    })
  }

  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  return res.status(200).send({
    ...toClient[toBeOrNotToBe],
    _originalBody: req.body,
  })
}
