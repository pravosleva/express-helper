// import { THelp } from '~/utils/interfaces'
import { THelp } from '~/utils/express-validation/interfaces'
import { mutateObject } from '~/utils/mutateObject'

// -- NOTE: Required fields
const requiredFields: (
  'firstName' | 'lastName' | 'middleName' | 'birthday'
)[] = [
    'firstName',
    'lastName',
    // 'middleName'?
    'birthday',
  ]
// --

export const profileChildAddingRules: THelp = {
  params: {
    body: {
      firstName: {
        type: 'string',
        descr: 'Name',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = 'Incorrect key'
              break
            default:
              break
          }

          return result
        },
      },
      middleName: {
        type: 'string',
        descr: 'middleName',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true, reason: 'not validated' }

          // switch (true) {
          //   case typeof val !== 'string' && typeof val :
          //     result.ok = false
          //     result.reason = 'Incorrect key'
          //     break
          //   default:
          //     break
          // }

          return result
        },
      },
      lastName: {
        type: 'string',
        descr: 'Last name',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = 'Incorrect key'
              break
            default:
              break
          }

          return result
        },
      },
      birthday: {
        type: 'string',
        descr: 'birthday',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Incorrect key (should be string, received: ${typeof val})`
              break
            default: {
              if (!val) {
                throw new Error(`Incorrent empty prop: "birthday" (${typeof val})`)
              }
              const chunks = val.split('-')
              if (
                chunks.length !== 3
                || chunks[0].length !== 4
              ) {
                throw new Error(`Incorrent prop value: "birthday" (received: ${val}, expected example: 2020-11-18)`)
              }
              break
            }
          }

          return result
        },
      },
    },
    query: {
      // _slow_server_imitation: {
      //   type: 'boolean',
      //   descr: 'Slow server imitation (you will have response in 500-3000 ms',
      //   required: false,
      // },
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
                  default: {

                    for (let i = 0, max = requiredFields.length; i < max; i++) {
                      const reqiuredFieldKey = requiredFields[i]
                      switch (true) {
                        case typeof json[reqiuredFieldKey] === 'undefined':
                          throw new Error(`Missed required prop: "${reqiuredFieldKey}"`)
                        case reqiuredFieldKey === 'birthday': {
                          if (!json[reqiuredFieldKey]) {
                            throw new Error(`Incorrent empty prop: "${reqiuredFieldKey}" (${typeof json[reqiuredFieldKey]})`)
                          }
                          const chunks = json[reqiuredFieldKey].split('-')
                          if (
                            chunks.length !== 3
                            || chunks[0].length !== 4
                          ) {
                            throw new Error(`Incorrent prop value: "${reqiuredFieldKey}" (received: ${json[reqiuredFieldKey]}, expected example: 2020-11-18)`)
                          }
                          // NOTE: Or nothing...
                          break
                        }
                        default:
                          break
                      }
                    }
                    // NOTE: Thats all, thanx.
                    break
                  }
                }
              } catch (err) {
                result.ok = false
                result.reason = `ERR: ${err.message || 'No err.message'}; req.query._addData shoud not be correctly encoded json; Use decodeURIComponent for this`
              }
              break
          }
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
    },
  },
}

export const profileChildAdding = (req, res) => {
  try {
    const { query: { _addData, _get500, _responseDelay } } = req;
    const targetResponse = {
      status: 'Success',
      requestId: '00000000-0000-0000-flee-000000000001',
      // data: undefined,
    }

    if (_get500 === '1')
      throw new Error('Frontend wants to have 500')

    if (!!_addData) {
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
            res.status(200).send(targetResponse)
          }, delay)
        }
        default:
          // v1
          return res.status(200).send(targetResponse)
      }
    }

    res.status(200).send(targetResponse)
  } catch (err) {
    res.status(200).send({
      status: 'Fail',
      requestId: '00000000-0000-0000-flee-000000000002',
      message: err.message || 'No err message',
    })
  }
}
