/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { getRandomInteger } from '~/utils/getRandomInteger'
import { Counter } from '~/utils/Counter'
import { THelp } from '~/utils/interfaces'

const counter = Counter()
const toClient = [
  { ok: false },
  { ok: true },
]
const _help: THelp = {
  params: {
    body: {
      id: {
        type: 'number',
        descr: 'Tradein id',
        required: true,
      },
      odd_success: {
        type: 'number',
        descr: 'Число запросов, кратно которому ответ будет успешным',
        required: false,
      },
      random_success: {
        type: 'boolean',
        descr: 'Успешный ответ либо нет',
        required: false,
      },
    },
  },
}

export const clientData = (req: any, res: any) => {
  const errs: string[] = []

  for (const key in _help.params.body) {
    if (_help.params.body[key].required && !req.body[key]) {
      errs.push(`Missing param ${key}`)
    }
  }
  if (errs.length > 0) return res.status(500).send({
    ok: false,
    message: `ERR: ${errs.join('; ')}`,
    _originalBody: req.body,
    _help,
  })

  const { odd_success, random_success } = req.body

  if (odd_success) {
    const count: number = counter.next().value || 0
    const isSuccess: boolean = count % odd_success === 0
    const message = `Остаток [${count} от ${odd_success} (${typeof odd_success})]: ${count % odd_success}`

    return res.status(200).send({
      ...toClient[Number(isSuccess)],
      message,
      _originalBody: req.body,
      _help,
    })
  }

  const toBeOrNotToBe = random_success ? getRandomInteger(0, 1) : 1
  const result: any = {
    ...toClient[toBeOrNotToBe],
    _originalBody: req.body,
    _help,
  }
  if (!toBeOrNotToBe) result.message = 'Err tetsing'

  return res.status(200).send(result)
}
