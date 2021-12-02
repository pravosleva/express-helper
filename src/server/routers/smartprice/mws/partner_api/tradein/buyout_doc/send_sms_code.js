import { getRandomInteger } from '~/utils/getRandomInteger'

const SUCCESS_ANYWAY = process.env.SUCCESS_ANYWAY === '1'

const toClient = [
  {
    ok: false,
    wait_seconds: 10,
  },
  {
    ok: true,
    wait_seconds: 15,
  },
]

export const sendSMSCode = (req, res) => {
  if (!req.body.id) {
    return res.status(200).send({
      ok: false,
      message: 'Missing required param: req.body.id',
      _originalBody: req.body,
    })
  }

  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  return res.status(200).send({
    ...toClient[toBeOrNotToBe],
    _originalBody: req.body,
  })
}
