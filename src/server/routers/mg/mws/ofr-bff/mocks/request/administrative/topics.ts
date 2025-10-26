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

export const administrativeTicketTopicsRules: THelp = {
  params: {
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

          try {
            const json = JSON.parse(val)
            switch (true) {
              // case typeof val !== 'object':
              //   throw new Error(`Expected object, received: ${typeof val}`)
              case Object.keys(json).length === 0:
                throw new Error('Expected object with keys')
              default:
                break
            }
          } catch (err) {
            result.ok = false
            result.reason = err?.message || 'No err?.message'
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

export const administrativeTicketTopics = async (req, res) => {
  const { _oddScenario, _slowServerImitation, _randomToken } = req.body
  const { _get500, _responseDelay, _getIncorrectData, _addData } = req.query

  const result: {
    status: 'Success' | 'Fail';
    data: {
      items: {
        dmsRequestSubcategoryID: string;
        name: string;
      }[] | null;
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
      items: [],
    },
    _service: {
      req: {
        body: req.body,
      },
      _help: administrativeTicketTopicsRules,
    },
  }

  try {
    if (_get500 === '1')
      throw new Error('Frontend wants to have 500')

    // - NOTE: Success case [2/2]
    // -- NOTE: Mutate result if necessary
    if (!!_addData) {
      const json = JSON.parse(decodeURIComponent(_addData))
      if (typeof json === 'object' && Object.keys(json).length > 0) {
        mutateObject({ target: result, source: json })
      }
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
        result.data.items = null
        break
      case _getIncorrectData === '2': {
        const toBeOrNot = getRandomInteger(0, 1)
        if (toBeOrNot) result.data.items = null
        break
      }
      default:
        break
    }
    // -

    // result._service.responseScenarioMapDetails = {
    //   size: responseScenarioMap.size
    // }

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
