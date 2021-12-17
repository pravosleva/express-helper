import { getRandomInteger } from '~/utils/getRandomInteger'

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    message: 'Fuckup tst',
  },
  {
    ok: true,
  },
]

export const acceptApi = async (req, res) => {
  if (!req.body.retailer_personnel_number || !req.body.id) {
    return res.status(200).send({
      ok: false,
      message: 'Required fields in req: retailer_personnel_number, id',
      _originalBody: req.body,
    })
  }

  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  return setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
