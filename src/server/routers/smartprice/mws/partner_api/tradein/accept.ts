// import { getRandomInteger } from '~/utils/getRandomInteger'
import { mutateObject } from '~/utils/mutateObject'

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
  const result = {
    ...toClient[toBeOrNotToBe],
    _originalBody: req.body,
  }
  const { _add_data } = req.body

  if (!!_add_data && typeof _add_data === 'object' && Object.keys(_add_data).length > 0)
    mutateObject({ target: result, source: _add_data })

  return setTimeout(() => {
    res.status(200).send(result)
  }, 5000)
}
