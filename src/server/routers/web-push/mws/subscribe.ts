import { THelp } from '~/utils/express-validation/interfaces'
import { mutateObject } from '~/utils/object-ops/mutateObject'
import { getIsExistsAndNumber } from '~/utils/string-ops'
// import webpush from 'web-push'
import { state as savedSubscription } from '~/routers/web-push/utils'
import { Request, Response } from 'express'

// -- NOTE: Moved
// const publicVapidKey = process.env.EH_WEB_PUSH_VAPID_PUBLIC_KEY || '';
// const privateVapidKey = process.env.EH_WEB_PUSH_VAPID_PRIVATE_KEY || '';
// const EH_WEB_PUSH_DEVELOPER_EMAIL = process.env.EH_WEB_PUSH_DEVELOPER_EMAIL;

// webpush.setVapidDetails(
//   `mailto:${EH_WEB_PUSH_DEVELOPER_EMAIL}`,
//   publicVapidKey,
//   privateVapidKey
// )
// --

// NOTE: Маршрут для сохранения подписки клиента
export const subscribeRules: THelp = {
  params: {
    body: {
      clientData: {
        type: 'object',
        descr: 'Client data',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (!val?.subscription || !val?.nickname) {
            result.ok = false
            result.reason = 'Incorrect format; Expected { subscription: PushSubscription }'
          }

          return result
        },
      },
    },
    query: {
      _addData: {
        type: 'object',
        descr: 'Data for response mutation (for success case only)',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query._addData shoud not be empty string'
              break
            // TODO: Others...
            default:
              try {
                const decoded = decodeURIComponent(val)
                const json = JSON.parse(decoded)

                switch (true) {
                  case typeof json !== 'object':
                    throw new Error('Incorrect format (Not object)')
                  case Object.keys(json).length === 0:
                    throw new Error('Incorrect format (Empty object)')
                  default:
                    // NOTE: Nothing...
                    break
                }
              } catch (err) {
                result.ok = false
                result.reason = `ERR: ${(err as Error).message || 'No err.message'}; req.query._addData shoud not be correctly encoded json; Use decodeURIComponent for this`
              }
              break
          }
          return result
        },
      },
      _setStatus: {
        type: 'number (stringified)',
        descr: 'Return target response status',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          const possibleValues = ['404', '500']

          if (!possibleValues.includes(val)) {
            result.ok = false
            result.reason = `Incorrect value: Received ${String(val)}; Expected values: ${possibleValues.join(', ')}`
          }
          if (!getIsExistsAndNumber(val)) {
            result.ok = false
            result.reason = `Статус ответа может быть числом; Возможые значения: ${possibleValues.join(', ')}`
          }

          return result
        }
      },
      _responseDelay: {
        type: 'number',
        descr: 'Return response with status 500',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (Number.isNaN(Number(val))) {
            result.ok = false
            result.reason = `Incorrect value: Received ${String(val)}; Expected: number`
          }

          return result
        }
      },
    },
  },
}

export const subscribe = (req: Request, res: Response) => {
  try {
    const { query: { _addData, _setStatus, _responseDelay } } = req;
    const targetResponse = {
      status: 'Success',
    }

    if (_setStatus === '500')
      throw new Error(`Frontend wants to have ${_setStatus}`)

    // -- NOTE: В продакшене сохраняйте в БД
    savedSubscription.add({ subscription: req.body.clientData.subscription, nickname: req.body.clientData.nickname })
    // --

    if (!!_addData && typeof _addData === 'string') {
      // NOTE: Alredy validated
      const json = JSON.parse(decodeURIComponent(_addData))

      // -- NOTE: Mutate result if necessary
      if (!!json && typeof json === 'object' && Object.keys(json).length > 0)
        mutateObject({ target: targetResponse, source: json })
      // --

      switch (true) {
        case !!_responseDelay: {
          const delay = Number(_responseDelay)
          return setTimeout(() => {
            res.status(!!_setStatus ? Number(_setStatus) : 200).send(targetResponse)
          }, delay)
        }
        default:
          // v1
          return res.status(!!_setStatus ? Number(_setStatus) : 200).send(targetResponse)
      }
    }

    res.status(!!_setStatus ? Number(_setStatus) : 201).send(targetResponse)
  } catch (err) {
    res.status(500).send({
      status: 'Fail',
      requestId: '00000000-0000-0000-abcd-000000000010',
      message: (err as Error)?.message || 'No err message',
    })
  }
}
