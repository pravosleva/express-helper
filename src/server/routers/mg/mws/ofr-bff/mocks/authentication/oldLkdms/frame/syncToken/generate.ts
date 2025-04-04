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

export const generateRules: THelp = {
  params: {
    body: {
      _oddScenario: {
        type: 'object',
        descr: 'Special scenario odj; Example: {"token":10,"uniquePollingKey":"abc"}',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          switch (true) {
            case typeof val !== 'object':
              result.ok = false
              result.reason = `Incorrect _oddScenario format; Object expected; Received: ${typeof val}`
              break
            default: {
              const getIsScenarioSettingsCorrect = (obj: any) => {
                const errs: string[] = []
                const requiredFields = [
                  {
                    name: 'token',
                    type: 'number',
                  },
                  {
                    name: 'uniquePollingKey',
                    type: 'string',
                  }
                ]
                for (const keyData of requiredFields) {
                  if (typeof obj[keyData.name] !== keyData.type)
                    errs.push(`Param errored: ${keyData.name}, received: "${obj[keyData.name]}" (${typeof obj[keyData.name]}); Expected: ${keyData.type}`)
                }
        
                if (errs.length > 0) return { ok: false, message: `Problem of _oddScenario: ${errs.join('; ')}` }
                else return { ok: true }
              }
              const scenarioCheckingResult = getIsScenarioSettingsCorrect(val)
              const isScenarioSettingsCorrect = scenarioCheckingResult.ok

              if (!isScenarioSettingsCorrect) {
                result.ok = false
                result.reason = `Incorrect format; ${scenarioCheckingResult.message}`
              }
              break
            }
          }

          return result
        },
      },
      _slowServerImitation: {
        type: 'boolean',
        descr: 'Slow server imitation (you will have response in 500-3000 ms',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (typeof val !== 'boolean') {
            result.ok = false
            result.reason = `Incorrect format: Received ${typeof val}; Expected: boolean`
          }

          return result
        },
      },
      _randomToken: {
        type: 'boolean',
        descr: 'Random token',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (typeof val !== 'boolean') {
            result.ok = false
            result.reason = `Incorrect format: Received ${typeof val}; Expected: boolean`
          }

          return result
        },
      },
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

          return result
        },
      },
    },
    query: {
      // uniquePollingKey: {
      //   type: 'string',
      //   descr: 'Your req id',
      //   required: false,
      //   validate: (val) => {
      //     const result: {
      //       ok: boolean;
      //       reason?: string;
      //     } = { ok: true }
      //     if (typeof val != 'string') {
      //       result.ok = false
      //       result.reason = 'Incorrect value'
      //     }
  
      //     return result
      //   }
      // },
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
      _getIncorrectData: {
        type: 'number (0|1)',
        descr: 'Get incorrect data (0 - no; 1 - yes)',
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
    },
  },
}

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/photo/status' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: application/json' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'Content-Type: application/json' -H 'X-SP-WebUI: 1' -H 'X-CSRFToken: HCKhOJSlzBKBUTKQ7YH9TZO1dMBtpiZy4Y1FpKZE7aNpeqazbz1gvjpEK4bqGNPc' -H 'X-Requested-With: XMLHttpRequest' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw '{"id":114851}'

// enum EStatus {
//   OK = 'ok',
//   NOT_CHECKED = 'not_checked',
//   FAKE = 'fake',
//   BAD_QUALITY = 'bad_quality',
// }
type TScenario = {
  // status: {
  //   [key in EStatus]: number;
  // },
  token: number;
  uniquePollingKey: string;
}

const responseScenarioMap = new Map<[key: string], TScenario>()

export const generate = async (req, res) => {
  const { _oddScenario, _addData, _slowServerImitation, _randomToken } = req.body
  const { _get500, _responseDelay, _getIncorrectData } = req.query

  const result: {
    status: 'Success' | 'Fail';
    data: {
      token: string;
      resyncAfterSeconds: number;
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
      // Default:
      token: '123',
      resyncAfterSeconds: 60,
    },
    _service: {
      req: {
        body: req.body,
      },
      _help: generateRules,
    },
  }

  try {
    if (_get500 === '1')
      throw new Error('Frontend wants to have 500')

    // NOTE: Step 1.
    if (!!_oddScenario) {
      // NOTE: Step 1.1 Check _oddScenario
      // [Moved to rules]

      // NOTE: Step 1.2 Get state or init zero state
      let userScenarioState = responseScenarioMap.get(_oddScenario.uniquePollingKey)
      if (!!userScenarioState) {
        // 1.2.1. NOTE: Mutate state
        try {
          for (const key in userScenarioState) {
            switch (key) {
              // NOTE: [1/2] Более сложный кейс
              // case 'token':
              //   // Ignore if already started
              //   if (userScenarioState[key] % _oddScenario[key] === 0) {
              //     // Do nothing...
              //   } else userScenarioState[key] += 1
              //   break
              default:
                userScenarioState[key] += 1
                break
            }
          }
          responseScenarioMap.set(_oddScenario.uniquePollingKey, userScenarioState)
        } catch (err) {
          return res.status(500).send({
            ok: false,
            message: `ERR1: ${err.message || 'No err.message'}`,
          })
        }
      } else {
        // 1.2.2. NOTE: Create initial state
        try {
          const newState: any = {}
          for (const key in _oddScenario) {
            switch (key) {
              // NOTE: [2/2] Более сложный кейс
              // case 'status':
              //   for (const scenarioKey in _oddScenario[key]) {
              //     if (!newState[key]) newState[key] = { [scenarioKey]: 1 }
              //     else newState[key][scenarioKey] = 1
              //   }
              //   break
              default:
                newState[key] = 1
                break
            }
          }
          userScenarioState = newState
          responseScenarioMap.set(_oddScenario.uniquePollingKey, userScenarioState)
        } catch (err) {
          return res.status(500).send({
            ok: false,
            message: `ERR2: ${err.message || 'No err.message'}`,
          })
        }
      }
      
      // NOTE: Step 1.3 Set result object by counters
      for (const key in userScenarioState) {
        switch (key) {
          case 'token':
            if (userScenarioState[key] % _oddScenario[key] === 0) {
              result.data.token = '1234'
            } else delete result.data.token
            break
          default:
            // Impossible case
            break
        }
      }

      // NOTE: Success case [1/2]
      if (!!result.data.token) {
        responseScenarioMap.delete(_oddScenario.uniquePollingKey)
      }
    }

    // - NOTE: Success case [2/2]
    if (!!result.data.token) {
      // -- NOTE: Mutate result if necessary
      if (!!_addData && typeof _addData === 'object' && Object.keys(_addData).length > 0) {
        mutateObject({ target: result, source: _addData })
      }
        
      // NOTE: Random if necessary
      if (_randomToken) {
        mutateObject({
          target: result,
          source: {
            data: {
              token: getRandomString(5),
            },
          },
        })
      }
      // --

      switch (true) {
        case _getIncorrectData === '1':
          result.data.resyncAfterSeconds = 0
          break
        case _getIncorrectData === '2': {
          const toBeOrNot = getRandomInteger(0, 1)
          if (toBeOrNot) result.data.resyncAfterSeconds = 0
          break
        }
        default:
          break
      }
    }
    // -

    result._service.responseScenarioMapDetails = {
      size: responseScenarioMap.size
    }

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
