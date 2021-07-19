import { getRandomInteger } from '../../../../utils/getRandomInteger'

const toClient = [
  {
    ok: false,
  },
  {
    ok: true,
  }
]

type TResult = {
  ok: boolean;
  [key: string]: any;
}

export default async (req, res) => {
  const toBeOrNotToBe = getRandomInteger(0, 1)

  const result: TResult = toClient[toBeOrNotToBe];

  setTimeout(() => {
    res.status(200).send({
      ...result,
      _originalBody: req.body,
    })
  }, 500)
}
