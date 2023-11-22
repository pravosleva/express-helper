/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { getRandomInteger } from '~/utils/getRandomInteger'
import { Counter } from '~/utils/Counter'
import { THelp } from '~/utils/interfaces'

const counter = Counter()
enum EStatus {
  Pending = 'pending',
  Added = 'added',
  Canceled = 'canceled',
  Retry = 'retry',
}
const toClient = [
  {
    ok: false,
  },
  {
    ok: true,
    status: EStatus.Retry
  },
  {
    ok: true,
    status: EStatus.Pending
  },
  {
    ok: true,
    status: EStatus.Added,
    card_number_ending: '7700'
  },
  {
    ok: true,
    status: EStatus.Canceled,
    message: 'Fuck you'
  },
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
        descr: 'Число запросов, кратно которому status будет успешным (если не указан random_success)',
        required: false,
      },
      random_success: {
        type: 'boolean',
        descr: 'Успешная привязка карты либо нет',
        required: false,
      },
    },
  },
  res: {
    ok: {
      type: 'boolean',
      required: true,
    },
    message: {
      type: 'string',
      descr: 'Fail reason text for user',
      required: false,
    },
    status: {
      type: 'string',
      descr: ['pending - продолжать ждать и опрашивать','added - закрыть iframe и запомнить, что карта привязана', 'canceled - закрыть iframe и запомнить, что карта не привязана'].join('\n'),
      required: false,
    }
  },
}

export const addingPayoutCardStatus = (req: any, res: any) => {
  const errs: string[] = []

  for (const key in _help.params.body) {
    if (_help.params.body[key].required && !req.body[key]) {
      errs.push(`Missing param ${key}`)
    }
  }
  if (errs.length > 0) return res.status(403).send({
    ok: false,
    message: `ERR: ${errs.join('; ')}`,
    _originalBody: req.body,
    _help,
  })

  const { odd_success, random_success } = req.body

  if (odd_success) {
    const count: number = counter.next().value || 0
    const ost: number = count % odd_success
    // let status: EStatus
    let result: any = {}
    switch (ost) {
      case 0:
        // status = EStatus.Added
        result = toClient[3]
        break
      default:
        // status = EStatus.Retry
        result = toClient[2]
        break
    }
    const _serviceMsg = `Остаток [${count} от ${odd_success} (${typeof odd_success})]: ${count % odd_success}`
    const toBeOrNotToBe = random_success ? getRandomInteger(0, 1) : 1

    if (result.status === EStatus.Added) {
      // NOTE: Random fail
      if (!toBeOrNotToBe) result = toClient[4] // EStatus.Canceled
    }

    return setTimeout(
      () => res.status(200).send({
        ...result,
        _serviceMsg,
      }),
      3000
    )
  }

  return setTimeout(
    () => res.status(200).send({
      ...toClient[0],
      message: 'Добавьте параметры: odd_success: number, random_success: bool',
      _originalBody: req.body,
      _help,
    }),
    3000
  )
}
