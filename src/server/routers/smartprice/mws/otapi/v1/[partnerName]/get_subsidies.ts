import { getRandomInteger } from '~/utils/getRandomInteger'

const toClient = [
  {
    ok: false,
    message: 'Test looooooong description erroooooor text UI mf 213 124 234234234234234 234234 23423 4234',
  },
  {
    ok: true,
    subsidies: [
      { model: 'Model 1', baseDiscount: 1000 },
      { model: 'Model 2', baseDiscount: 2000 },
    ],
  },
]

export const getSubsidiesRoute = (req, res) => {
  // NOTE: Соответственно, субсидии будут возвращаться для текущего состояния устройства.
  // Если между запросами состояние изменится (т.е., после проверки по фото),
  // то и значения тоже могут измениться.
  /* REQ SAMPLE:
  { "id": 456 } */
  const requiredFields = ['device']
  const errs = []
  for (const key of requiredFields) if (!req.body[key]) errs.push(`${key} is required!`)
  if (errs.length > 0) {
    return res.status(200).send({
      ok: false,
      message: `Incorrect params: ${errs.join('; ')}`,
      _originalBody: req.body,
    })
  }

  const toBeOrNotToBe = 1 // getRandomInteger(0, 1)
  const getRandomSubsidies = () => [1, 2, 3, 4].reduce((acc, cur) => {
    acc.push({ model: `Model ${cur}`, baseDiscount: getRandomInteger(cur * 1000, 9999) })
    return acc
  }, [])

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      subsidies: toBeOrNotToBe ? getRandomSubsidies() : [],
      _originalBody: req.body,
    })
  }, 3000)
}
