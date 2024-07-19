// import { getRandomInteger } from '~/utils/getRandomInteger'

// const { SUCCESS_ANYWAY } = process.env

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
  if (!req.body.id) { // !req.body.retailer_personnel_number ||
    return res.status(200).send({
      ok: false,
      message: 'Required fields in req: id',
      _originalBody: req.body,
    })
  }

  const toBeOrNotToBe = 1 // SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  return setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 5000)
}
