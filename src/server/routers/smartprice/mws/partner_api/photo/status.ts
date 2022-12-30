/* eslint-disable import/extensions */
// @ts-ignore
// import { getRandomInteger } from '~/utils/getRandomInteger'
// @ts-ignore
// import { Counter } from '~/utils/counter'
import { THelp } from '~/utils/interfaces'

// const { SUCCESS_ANYWAY } = process.env
// const counter = Counter()

const _help: THelp = {
  params: {
    body: {
      _odd_scenario: {
        type: 'object',
        descr: 'Special scenario odj; Example: {"status":{"not_checked":5,"ok":20},"started": 10,"success": 2}',
        required: false,
      },
    },
  },
}

const toClient = [
  {
    ok: false,
    code: 'ERR_CODE_4_XAMPLE',
    message: 'Tst err from express-helper',
  },
  {
    ok: true,
    started: false,
    status: 'not_checked', // Чтоб крутилка исчезла и флоу пошел дальше
    photo_states: {},
    loop: false,
    condition_limit: null,
    condition_limit_reason: null,
    is_condition_limit_violated: false,
  },
]

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/photo/status' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: application/json' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'Content-Type: application/json' -H 'X-SP-WebUI: 1' -H 'X-CSRFToken: HCKhOJSlzBKBUTKQ7YH9TZO1dMBtpiZy4Y1FpKZE7aNpeqazbz1gvjpEK4bqGNPc' -H 'X-Requested-With: XMLHttpRequest' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw '{"id":114851}'

enum EStatus {
  OK = 'ok',
  NOT_CHECKED = 'not_checked',
  FAKE = 'fake',
  BAD_QUALITY = 'bad_quality',
}
type TScenario = {
  status: {
    [key in EStatus]: number;
  },
  started: number;
  success: number;
  uniquePollingKey: string;
}

const responseScenarioMap = new Map<[key: string], TScenario>()

export default async (req, res) => {
  const { _odd_scenario } = req.body

  const result: any = {
    _originalBody: req.body,
    // Default:
    ok: false,
    status: EStatus.NOT_CHECKED,
    started: false,
  }

  try {
    // NOTE: Step 1.
    if (!!_odd_scenario) {
      // NOTE: Step 1.1 Check _odd_scenario
      const getIsScenarioSettingsCorrect = (obj) => {
        const errs: string[] = []
        const requiredFields = [
          {
            name: 'status',
            type: 'object',
          },
          {
            name: 'started',
            type: 'number',
          },
          {
            name: 'success',
            type: 'number',
          },
          {
            name: 'uniquePollingKey',
            type: 'string',
          }
        ]
        for (const keyData of requiredFields) {
          if (obj[keyData.name]?.required && (!obj[keyData.name] || typeof obj[keyData.name] !== keyData.type))
            errs.push(`Param errored: ${keyData.name}`)
        }
        // NOTE: Check status obj
        if (Object.keys(obj.status).length === 0) errs.push('req.body._odd_scenario.status should be object!')
        if (Object.values(obj.status).every((v) => typeof v === 'number')) {
          // Go on...
        } else errs.push('The values of req.body._odd_scenario.status obj should be numbers')

        if (errs.length > 0) return { ok: false, message: errs.join('; ') }
        else return { ok: true }
      }

      const scenarioCheckingResult = getIsScenarioSettingsCorrect(_odd_scenario)
      const isScenarioSettingsCorrect = scenarioCheckingResult.ok

      if (!isScenarioSettingsCorrect) return res.status(200).send({
        ok: false,
        message: `req.body._odd_scenario is incorrect (see res._help object); ${scenarioCheckingResult.message}`,
        _help,
        _originalBody: req.body,
      })

      // NOTE: Step 1.2 Get state or init zero state
      let userScenarioState = responseScenarioMap.get(_odd_scenario.uniquePollingKey)
      if (!!userScenarioState) {
        // 1.2.1. NOTE: Mutate state
        try {
          for (const key in userScenarioState) {
            switch (key) {
              case 'status':
                for (const statusKey in _odd_scenario.status) {
                  if (!!userScenarioState[key]) {
                    if (!!userScenarioState[key][statusKey]) {
                      userScenarioState[key][statusKey] += 1
                    } else {
                      userScenarioState[key][statusKey] = 1
                    }
                  } else {
                    // @ts-ignore
                    userScenarioState[key] = {}
                    userScenarioState[key][statusKey] = 1
                  }
                }
                break
              case 'started':
              case 'success':
                // Ignore if already started
                if (userScenarioState[key] % _odd_scenario[key] === 0) {
                  // Do nothing...
                } else userScenarioState[key] += 1
                break
              default:
                userScenarioState[key] += 1
                break
            }
          }
          responseScenarioMap.set(_odd_scenario.uniquePollingKey, userScenarioState)
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
          for (const key in _odd_scenario) {
            switch (key) {
              case 'status':
                for (const statusKey in _odd_scenario.status) {
                  if (!newState[key]) newState[key] = { [statusKey]: 1 }
                  else newState[key][statusKey] = 1
                }
                break
              default:
                newState[key] = 1
                break
            }
          }
          userScenarioState = newState
          responseScenarioMap.set(_odd_scenario.uniquePollingKey, userScenarioState)
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
          case 'status':
            for (const statusKey in _odd_scenario.status) {
              if (userScenarioState.status[statusKey] % _odd_scenario.status[statusKey] === 0) {
                // NOTE: Statuses priority
                switch (statusKey) {
                  case EStatus.OK:
                    result.status = statusKey
                    break
                  case EStatus.BAD_QUALITY:
                    result.status = statusKey
                    break
                  case EStatus.FAKE:
                    result.status = statusKey
                    break
                  case EStatus.NOT_CHECKED:
                    result.status = statusKey
                    break
                  default:
                    result.status = statusKey
                    break
                }
              }
            }
            break
          case 'started':
            if (userScenarioState[key] % _odd_scenario[key] === 0) result.started = true
            else result.started = false
            break
          case 'success': 
            if (userScenarioState[key] % _odd_scenario[key] === 0) result.ok = true
            else result.ok = false
            break
          default:
            // Impossible case
            break
        }
      }

      if (result.status === EStatus.OK) responseScenarioMap.delete(_odd_scenario.uniquePollingKey)

      result._service = {
        responseScenarioMap: {
          size: responseScenarioMap.size
        }
      }

      return res.status(200).send(result)
    }
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message',
    })
  }

  // NOTE: Step 2. Default way
  // if (odd_success) {
  //   const count: number = counter.next().value || 0
  //   const isOddSuccess: boolean = count % odd_success === 0
  //   const isSuccess = isOddSuccess && random_success ? getRandomInteger(0, 1) : isOddSuccess
  //   const message = `Custom fuckup ${count} % ${odd_success} (${typeof odd_success}): ${count % odd_success}`
  //   const result = {
  //     ...toClient[Number(isSuccess)],
  //     message,
  //     _originalBody: req.body,
  //     _help,
  //   }

  //   if (isSuccess && _set_started_flag) result.started = true
  //   if (isSuccess && _set_custom_status) result.status = _set_custom_status

  //   return res.status(200).send(result)
  // }

  // // const result = {
  // //   ...toClient[toBeOrNotToBe],
  // //   _originalBody: req.body,
  // // }

  const toBeOrNotToBe = 0 // SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  return setTimeout(() => {
    res.status(200).send({
      // ...result,
      ...toClient[toBeOrNotToBe],
    })
  }, 1000)
}
