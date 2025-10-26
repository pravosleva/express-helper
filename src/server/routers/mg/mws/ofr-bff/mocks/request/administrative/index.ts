/* eslint-disable import/extensions */
// @ts-ignore
import { getRandomInteger } from '~/utils/getRandomInteger'
import { getRandomString } from '~/utils/getRandomString'
// @ts-ignore
// import { Counter } from '~/utils/Counter'
// import { THelp } from '~/utils/interfaces'
import { THelp } from '~/utils/express-validation/interfaces'
import { mutateObject } from '~/utils/mutateObject'

// const { SUCCESS_ANYWAY } = process.env
// const counter = Counter()

export const administrativeTicketRules: THelp = {
  params: {
    body: {
      topic: {
        required: true,
        type: 'string',
        descr: 'Тема',
        validate: (val) => {
          const result: { ok: boolean; reason?: string; } = { ok: true }
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Incorrect formal (expected string, received: ${typeof val})`
              break
            case !val:
              result.ok = false
              result.reason = `Incorrect formal (expected not empty string, received: "${val}")`
              break
            default:
              break
          }

          return result
        },
      },
      messageText: {
        required: true,
        type: 'string',
        descr: 'Msg',
        validate: (val) => {
          const result: { ok: boolean; reason?: string; } = { ok: true }
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Incorrect formal (expected string, received: ${typeof val})`
              break
            case !val:
              result.ok = false
              result.reason = `Incorrect formal (expected not empty string, received: "${val}")`
              break
            default:
              break
          }

          return result
        },
      },
      files: {
        required: false,
        type: 'string',
        descr: 'Files',
        validate: (val) => {
          const reqiuredItemProps = ['name', 'fileStoreId']
          const result: { ok: boolean; reason?: string; } = { ok: true }
          switch (true) {
            case !Array.isArray(val):
              result.ok = false
              result.reason = `Incorrect formal (expected Array, received: ${typeof val})`
              break
            case val.length === 0:
              result.ok = false
              result.reason = 'Пустой массив files слать необязательно'
              break
            case val.some((e: { fileStoreId: string; name: string; }) =>
              reqiuredItemProps.some(k => typeof e[k] === 'undefined' || !e[k])
            ):
              result.ok = false
              result.reason = `Каждый елемент массива files должен иметь непустые поля: ${reqiuredItemProps.map(v => `"${v}"`).join(', ')}`
              break
            // TODO: Возможно, добавится еще проверка других полей
            default:
              break
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

          if (typeof val !== 'object' || Object.keys(val).length === 0) {
            result.ok = false
            result.reason = 'Incorrect value'
          }
          // TODO: Проверить объект...

          return result
        },
      },
      _get500: {
        type: 'number (0|1|2)',
        descr: 'Return response with status 500 (0 - no; 1- yes; 2 - random)',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          const possibleValues = ['0', '1', '2']

          if (!possibleValues.includes(val)) {
            result.ok = false
            result.reason = `Incorrect value: Received ${String(val)}; Expected values: ${possibleValues.join(', ')}`
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
      // _getIncorrectData: {
      //   type: 'number (0|1)',
      //   descr: 'Get incorrect data (0 - no; 1 - yes)',
      //   required: false,
      //   validate: (val) => {
      //     const result: {
      //       ok: boolean;
      //       reason?: string;
      //     } = { ok: true }
      //     const possibleValues = ['0', '1', '2']

      //     if (!possibleValues.includes(val)) {
      //       result.ok = false
      //       result.reason = `Incorrect value: Received ${String(val)}; Expected values: ${possibleValues.join(', ')}`
      //     }

      //     return result
      //   }
      // },
    },
  },
}

export const administrativeTicket = async (req, res) => {
  const { _oddScenario, _slowServerImitation, _randomToken } = req.body
  const { _get500, _responseDelay, _getIncorrectData, _addData } = req.query

  const result: {
    status: 'Success' | 'Fail';
    data: {
      dmsRequestID: number;
      dmsRequestNumber: string;
      requestID: string;
      requestNumber: string;
    };
    _service?: {
      req: {
        body: any;
      },
      _help: THelp;
      responseScenarioMapDetails?: {
        size: number;
      };
    };
  } = {
    status: 'Success',
    data: {
      // -- NTOE: Default for example
      dmsRequestID: getRandomInteger(0, 9999),
      dmsRequestNumber: `ADM-${getRandomInteger(1000, 9999)}`,
      requestID: `${getRandomString(8)}-${getRandomString(4)}-${getRandomString(4)}-${getRandomString(12)}`,
      requestNumber: '25463165',
      // --
    },
    _service: {
      req: {
        body: req.body,
      },
      _help: administrativeTicketRules,
    },
  }

  try {
    if (_get500 === '1')
      throw new Error('Frontend wants to have 500')

    // NOTE: Step 1.
    // - NOTE: Success case [2/2]

    // -- NOTE: Mutate result if necessary
    if (!!_addData) {
      const json = JSON.parse(decodeURIComponent(_addData))
      if (typeof json === 'object' && Object.keys(json).length > 0) {
        mutateObject({ target: result, source: json })
      }
    }

    // NOTE: Random if necessary
    // if (_randomToken) {
    //   mutateObject({
    //     target: result,
    //     source: {
    //       data: {
    //         token: getRandomString(5),
    //       },
    //     },
    //   })
    // }
    // --
    // -

    switch (true) {
      case !!_responseDelay: {
        const delay = Number(_responseDelay)
        return setTimeout(() => {
          res.status(200).send(result)
        }, delay)
      }
      case _slowServerImitation: {
        // v2
        const repronseTime = getRandomInteger(500, 3000)

        return setTimeout(() => {
          res.status(200).send(result)
        }, repronseTime)
      }
      default:
        // v1
        return res.status(200).send(result)
    }
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message',
    })
  }
}
