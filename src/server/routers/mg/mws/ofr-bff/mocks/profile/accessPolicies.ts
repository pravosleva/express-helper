// import { THelp } from '~/utils/interfaces'
import { THelp, TValidationResult } from '~/utils/express-validation/interfaces'
import { getIsNumeric, getRandomInteger, getRandomString } from '~/utils';
import { mutateObject } from '~/utils/object-ops/mutateObject'
import { setNestedValue, getNestedValue } from '~/utils/object-ops'
import { testTextByAllWords, getExtractedValues, getIsExistsAndNumber } from '~/utils/string-ops'

namespace NSScenario {
  export namespace NSDataItemsElementMutation {
    export enum ETargetActionCode {
      SET_RANDOM_INT = 'set_random_integer',
      SET_NULL = 'set_null',
      SET_RANDOM_STRING = 'set_random_string'
      // NOTE: And special case: set_target_value[value=YOUR_VALUE]
    }
    export type TItemScenarioSettings = {
      targetSensorKeyPath: string;
      targetSensorKeyValue: string; // NOTE: Example: 'SecondOpinionRequest'
      targetMutationPath: string;
      targetActionCode: ETargetActionCode,
    }
  }
  export namespace NSFreeDataMutation {
    export enum ETargetActionCode {
      SET_RANDOM_INT = 'set_random_integer',
      SET_NULL = 'set_null',
      SET_RANDOM_STRING = 'set_random_string'
      // NOTE: And special case: set_target_value[value=YOUR_VALUE]
    }
    export type TScenarioSettings = {
      targetMutationPath: string;
      targetActionCode: ETargetActionCode,
    }
  }
}

export const accessPoliciesRules: THelp = {
  params: {
    query: {
      _makeScenario: {
        type: 'string -> wich could be encoded to configs array: NSScenario.NSDataItemsElementMutation.TItemScenarioSettings[]',
        descr: 'Special scenario',
        required: false,
        validate: (val) => {
          const result: TValidationResult = { ok: true }
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = 'Expected string'
              break
            default: {
              try {
                const decodedJson: {
                  _dataItemsElementMutation?: NSScenario.NSDataItemsElementMutation.TItemScenarioSettings[];
                  _freeDataMutation?: NSScenario.NSFreeDataMutation.TScenarioSettings[];
                  // NOTE: Whatever
                } = JSON.parse(decodeURIComponent(val))
                switch (true) {
                  case !!decodedJson._dataItemsElementMutation && !Array.isArray(decodedJson._dataItemsElementMutation):
                    result.ok = false
                    result.reason = 'decodedJson._dataItemsElementMutation should be an Array: NSScenario.NSDataItemsElementMutation.TItemScenarioSettings[]'
                    break
                  case !!decodedJson._dataItemsElementMutation: {
                    const requiredFieldsForThisCase: (keyof NSScenario.NSDataItemsElementMutation.TItemScenarioSettings)[] = [
                      'targetSensorKeyPath',
                      'targetSensorKeyValue',
                      'targetMutationPath',
                      'targetActionCode',
                    ]
                    const errorMsgs = []
                    for (const scenarioItem of decodedJson._dataItemsElementMutation) {
                      for (const key of requiredFieldsForThisCase) {
                        if (!scenarioItem[key]) {
                          result.ok = false
                          result.reason = `Missed required prop _dataItemsElementMutation.${key} (received ${typeof decodedJson._dataItemsElementMutation[key]})`
                        } else {
                          switch (key) {
                            case 'targetActionCode':
                              // ---
                              switch (true) {
                                case testTextByAllWords({
                                  text: scenarioItem[key],
                                  words: ['set_target_value', '[value=', ']'],
                                }):
                                  // NOTE: Special case before next handler
                                  const numValues = getExtractedValues({
                                    tested: [scenarioItem[key]],
                                    expectedKey: 'value',
                                    valueType: 'number',
                                  })
                                  const strValues = getExtractedValues({
                                    tested: [scenarioItem[key]],
                                    expectedKey: 'value',
                                    valueType: 'string',
                                  })
                                  switch (true) {
                                    case numValues.length > 0 && Number.isNaN(Number(numValues[0])): {
                                      // const targetValue = Number(numValues[0])
                                      errorMsgs.push('Incorrect metascript! First value is not a number')
                                      break
                                    }
                                    case strValues.length > 0 && !strValues[0]: {
                                      // const targetValue = strValues[0]
                                      errorMsgs.push(`Incorrect metascript! First value should be not empty string, received: "${strValues[0]}" (${typeof strValues[0]})`)
                                      break
                                    }
                                    default:
                                      // errorMsgs.push(`Unexpected case for targetActionCode="${key}", Unexpected metascript`)
                                      break
                                  }
                                  break
                                case !Object.values(NSScenario.NSDataItemsElementMutation.ETargetActionCode).includes(scenarioItem[key]):
                                  errorMsgs.push(
                                    [
                                      `Unexpected target action code: ${scenarioItem[key]}`,
                                      `(expected values: ${[...Object.values(NSScenario.NSDataItemsElementMutation.ETargetActionCode), 'set_target_value[value=YOUR_VALUE]'].join(', ')})`,
                                    ].join(' ')
                                  )
                                  break
                                default:
                                  // NOTE: До этого не дойдет, если выполнится пред. кейс
                                  // NOTE: Whatever
                                  // errorMsgs.push(`Unexpected case for targetActionCode in ${JSON.stringify(scenarioItem)}`)
                                  break
                              }
                              // ---
                              break;
                            default:
                              // NOTE: Whatever for other "requiredFieldsForThisCase" keys
                              break;
                          }
                        }
                      }
                    }

                    if (errorMsgs.length > 0) {
                      result.ok = false
                      result.reason = errorMsgs.join('; ')
                    }
                    break
                  }
                  case !!decodedJson._freeDataMutation && !Array.isArray(decodedJson._freeDataMutation):
                    result.ok = false
                    result.reason = 'decodedJson._freeDataMutation should be an Array: NSScenario.NSFreeDataMutation.TScenarioSettings[]'
                    break
                  case !!decodedJson._freeDataMutation: {
                    const requiredFieldsForThisCase: (keyof NSScenario.NSFreeDataMutation.TScenarioSettings)[] = [
                      'targetMutationPath',
                      'targetActionCode',
                    ]
                    const errorMsgs = []

                    for (const scenarioItem of decodedJson._freeDataMutation) {
                      for (const key of requiredFieldsForThisCase) {
                        if (!scenarioItem[key]) {
                          result.ok = false
                          result.reason = `Missed required prop _freeDataMutation.${key} (received ${typeof scenarioItem[key]})`
                        } else {
                          switch (key) {
                            case 'targetActionCode':
                              // ---
                              switch (true) {
                                case !Object.values(NSScenario.NSFreeDataMutation.ETargetActionCode).includes(scenarioItem[key]):
                                  errorMsgs.push(
                                    [
                                      `Unexpected target action code: ${scenarioItem[key]}`,
                                      `(expected values: ${[
                                        ...Object.values(NSScenario.NSFreeDataMutation.ETargetActionCode),
                                        // 'set_target_value[value=YOUR_VALUE]'
                                      ].join(', ')})`,
                                    ].join(' ')
                                  )
                                  break
                                default:
                                  break
                              }
                              // ---
                              break;
                            default:
                              // NOTE: Whatever for other "requiredFieldsForThisCase" keys
                              break;
                          }
                        }
                      }
                    }

                    if (errorMsgs.length > 0) {
                      result.ok = false
                      result.reason = errorMsgs.join('; ')
                    }
                    break
                  }
                  default:
                    break
                }
              } catch (err) {
                result.ok = false
                result.reason = `Предположительно, ошибка парсинга? ${err?.message || 'No err?.message'}`
              }
              break
            }
          }
          return result;
        },
      },
      _addData: {
        type: 'object',
        descr: 'Data for response mutation (for success case only)',
        required: false,
        validate: (val) => {
          const result: TValidationResult = { ok: true }
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
                result.reason = `ERR: ${err.message || 'No err.message'}; req.query._addData shoud not be correctly encoded json; Use decodeURIComponent for this`
              }
              break
          }
          return result
        },
      },
      // _get500: {
      //   type: 'number: 0|1|2',
      //   descr: 'Return response with status 500 (0->no, 1->yes, 2->random)',
      //   required: false,
      //   validate: (val) => {
      //     const result: TValidationResult = { ok: true }
      //     const possibleValues = ['0', '1', '2']
      //     if (!possibleValues.includes(val)) {
      //       result.ok = false
      //       result.reason = `Incorrect value: Received ${String(val)}; Expected values: ${possibleValues.join(', ')}`
      //     }
      //     return result
      //   }
      // },
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
        type: 'number (ms)',
        descr: 'Return response with delay',
        required: false,
        validate: (val) => {
          const result: TValidationResult = { ok: true }
          if (!getIsNumeric(val)) {
            result.ok = false
            result.reason = `Incorrect value: received ${String(val)}, could not be converted to number`
          }
          return result
        }
      },
    },
  },
}

export const getAccessPolicies = (req, res) => {
  try {
    const { query: { _addData, _setStatus, _responseDelay, _makeScenario } } = req;
    const targetResponse = {
      success: true,
      status: 'Success',
      data: {
        mostActualDmsPolicyActiveStatus: null,
        Items: [],
      }
    }
    if (!!_addData) {
      // NOTE: Alredy validated
      const json = JSON.parse(decodeURIComponent(_addData))

      // -- NOTE: Mutate result if necessary
      if (!!json && typeof json === 'object' && Object.keys(json).length > 0)
        mutateObject({ target: targetResponse, source: json })
      // --
    }
    if (_setStatus === '500')
      throw new Error(`Frontend wants to have ${_setStatus}`)

    // -- NOTE: Special scenario
    const logs: string[] = []
    // --- NOTE: _dataItemsElementMutation
    try {
      const jsonScenario: {
        _dataItemsElementMutation?: NSScenario.NSDataItemsElementMutation.TItemScenarioSettings[];
        // NOTE: Whatever
      } = JSON.parse(decodeURIComponent(_makeScenario))
      let _c1 = 0
      for (const scenarioItem of jsonScenario?._dataItemsElementMutation) {
        switch (true) {
          case (
            !!scenarioItem
            && !!scenarioItem.targetSensorKeyPath
            && !!scenarioItem?.targetMutationPath
            && !!scenarioItem?.targetActionCode
            && !!scenarioItem?.targetSensorKeyValue
            && !!targetResponse.data?.Items
            && Array.isArray(targetResponse.data?.Items)
          ): {
              logs.unshift(`⚪ case 1.0 _dataItemsElementMutation [${_c1}]`)
              logs.unshift(`jsonScenario._dataItemsElementMutation.targetSensorKeyPath -> ${scenarioItem.targetSensorKeyPath}`)
              logs.unshift(`jsonScenario?._dataItemsElementMutation?.targetSensorKeyValue -> ${scenarioItem.targetSensorKeyValue}`)
              logs.unshift(`1st elm getNestedValue({ obj: targetResponse.data?.Items[0], path: jsonScenario._dataItemsElementMutation.targetSensorKeyPath -> "${scenarioItem.targetSensorKeyPath}" }) <- ${getNestedValue({ obj: targetResponse.data?.Items[0], path: scenarioItem.targetSensorKeyPath })}`)
              const targetItemIndex = targetResponse.data?.Items.findIndex((e) => getNestedValue({ obj: e, path: scenarioItem.targetSensorKeyPath }) === scenarioItem.targetSensorKeyValue)
              if (targetItemIndex !== -1) {
                logs.unshift('👍 case 1.1 Element found')
                const mutatedItem = { ...targetResponse.data?.Items[targetItemIndex] }
                switch (true) {
                  case scenarioItem.targetActionCode === 'set_random_integer': {
                    logs.unshift('case 1.1.1 scenarioItem.targetActionCode -> set_random_integer')
                    logs.unshift(`case 1.1.1 (1) -> mutatedItem BEFORE <- ${JSON.stringify(mutatedItem)}`)
                    setNestedValue(mutatedItem, scenarioItem.targetMutationPath, getRandomInteger(1000, 9999))
                    logs.unshift(`🟢 case 1.1.1 (2) mutatedItem AFTER -> ${JSON.stringify(mutatedItem)}`)
                    break
                  }
                  case scenarioItem.targetActionCode === 'set_null':
                    logs.unshift('🟢 case 1.1.2 scenarioItem.targetActionCode -> set_null')
                    setNestedValue(mutatedItem, scenarioItem.targetMutationPath, null)
                    break
                  case scenarioItem.targetActionCode === 'set_random_string': {
                    logs.unshift('case 1.1.3 scenarioItem.targetActionCode -> set_random_string')
                    logs.unshift(`case 1.1.3 (1) -> mutatedItem BEFORE <- ${JSON.stringify(mutatedItem)}`)
                    setNestedValue(mutatedItem, scenarioItem.targetMutationPath, getRandomString(5))
                    logs.unshift(`🟢 case 1.1.3 (2) mutatedItem AFTER -> ${JSON.stringify(mutatedItem)}`)
                    break
                  }
                  case testTextByAllWords({
                    text: scenarioItem.targetActionCode,
                    words: ['set_target_value', '[value=', ']'],
                  }): {
                      const numValues = getExtractedValues({
                        tested: [scenarioItem.targetActionCode],
                        expectedKey: 'value',
                        valueType: 'number',
                      })
                      const strValues = getExtractedValues({
                        tested: [scenarioItem.targetActionCode],
                        expectedKey: 'value',
                        valueType: 'string',
                      })

                      switch (true) {
                        case numValues.length > 0 && typeof Number(numValues[0]) === 'number':
                          setNestedValue(mutatedItem, scenarioItem.targetMutationPath, Number(numValues[0]))
                          logs.unshift(`🟢 Подставлено первое найденное значение из следующих: ${numValues.join(', ')}`)
                          break
                        case strValues.length > 0 && !!strValues[0]:
                          setNestedValue(mutatedItem, scenarioItem.targetMutationPath, strValues[0])
                          logs.unshift(`🟢 Подставлено первое найденное значение из следующих: ${strValues.join(', ')}`)
                          break
                        default:
                          break
                      }
                    }
                  default:
                    logs.unshift('case 1.1.4 -> default (nothing)')
                    break
                }
                try {
                  (targetResponse.data.Items as any)[targetItemIndex] = { ...mutatedItem }
                } catch (err) {
                  logs.unshift(`🔴 ${err?.message || 'No err?.message'}`)
                }
              } else {
                logs.unshift('⭕ case 1.2 No element')
              }
              break
            }
          default:
            break
        }
        _c1 += 1
      }
    } catch (err) {
      logs.unshift(err?.message || 'Предположительно, ошибка парсинга')
      // - NOTE: Добавим стандартную логику
      switch (true) {
        case !!_responseDelay: {
          const delay = Number(_responseDelay)
          return setTimeout(() => {
            res.status(!!_setStatus ? Number(_setStatus) : 200).send({ ...targetResponse, logs })
          }, delay)
        }
        default:
          return res.status(!!_setStatus ? Number(_setStatus) : 200).send({ ...targetResponse, logs })
      }
      // -
    }
    // ---
    // --- NOTE: _freeDataMutation
    try {
      const jsonScenario: {
        _freeDataMutation?: NSScenario.NSFreeDataMutation.TScenarioSettings[];
        // NOTE: Whatever
      } = JSON.parse(decodeURIComponent(_makeScenario))
      let _c2 = 0
      for (const scenarioItem of jsonScenario?._freeDataMutation) {
        switch (true) {
          case (
            !!scenarioItem
            && !!scenarioItem?.targetMutationPath
            && !!scenarioItem?.targetActionCode
            && typeof getNestedValue({ obj: targetResponse.data, path: scenarioItem.targetMutationPath }) !== 'undefined'
          ): {
              logs.unshift(`⚪ case 2.0 _freeDataMutation [${_c2}]`)
              logs.unshift(`🟡 target elm getNestedValue({ obj: targetResponse.data, path: "${scenarioItem.targetMutationPath}" }) <- ${getNestedValue({ obj: targetResponse.data, path: scenarioItem.targetMutationPath })}`)

              const oldValue = getNestedValue({ obj: targetResponse.data, path: scenarioItem.targetMutationPath })

              if (typeof oldValue === 'object' && !!oldValue) {
                logs.unshift('👍 case 2.1 Element found')
                const mutatedItem = oldValue
                switch (true) {
                  case scenarioItem.targetActionCode === 'set_random_integer': {
                    logs.unshift('case 2.1.1 scenarioItem.targetActionCode -> set_random_integer')
                    logs.unshift(`case 2.1.1 (1) mutatedItem BEFORE <- ${JSON.stringify(mutatedItem)}`)
                    setNestedValue(mutatedItem, scenarioItem.targetMutationPath, getRandomInteger(1000, 9999))
                    logs.unshift(`🟢 case 2.1.1 (2) mutatedItem AFTER -> ${JSON.stringify(mutatedItem)}`)
                    break
                  }
                  case scenarioItem.targetActionCode === 'set_null':
                    logs.unshift('🟢 case 2.1.2 scenarioItem.targetActionCode -> set_null')
                    setNestedValue(mutatedItem, scenarioItem.targetMutationPath, null)
                    break
                  case scenarioItem.targetActionCode === 'set_random_string': {
                    logs.unshift('case 2.1.3 scenarioItem.targetActionCode -> set_random_string')
                    logs.unshift(`case 2.1.3 (1) -> mutatedItem BEFORE <- ${JSON.stringify(mutatedItem)}`)
                    setNestedValue(mutatedItem, scenarioItem.targetMutationPath, getRandomString(5))
                    logs.unshift(`🟢 case 2.1.3 (2) mutatedItem AFTER -> ${JSON.stringify(mutatedItem)}`)
                    break
                  }
                  // case testTextByAllWords({
                  //   text: scenarioItem.targetActionCode,
                  //   words: ['set_target_value', '[value=', ']'],
                  // }): {
                  //     const numValues = getExtractedValues({
                  //       tested: [scenarioItem.targetActionCode],
                  //       expectedKey: 'value',
                  //       valueType: 'number',
                  //     })
                  //     const strValues = getExtractedValues({
                  //       tested: [scenarioItem.targetActionCode],
                  //       expectedKey: 'value',
                  //       valueType: 'string',
                  //     })
                  //     switch (true) {
                  //       case numValues.length > 0 && typeof Number(numValues[0]) === 'number':
                  //         setNestedValue(mutatedItem, scenarioItem.targetMutationPath, Number(numValues[0]))
                  //         logs.unshift(`Подставлено первое найденное значение из следующих: ${numValues.join(', ')}`)
                  //         break
                  //       case strValues.length > 0 && !!strValues[0]:
                  //         setNestedValue(mutatedItem, scenarioItem.targetMutationPath, strValues[0])
                  //         logs.unshift(`Подставлено первое найденное значение из следующих: ${strValues.join(', ')}`)
                  //         break
                  //       default:
                  //         break
                  //     }
                  //   }
                  default:
                    logs.unshift('case 2.1.4 -> default (nothing)')
                    break
                }
                try {
                  setNestedValue(targetResponse.data, scenarioItem.targetMutationPath, mutatedItem)
                } catch (err) {
                  logs.unshift(`🔴 ${err?.message || 'No err?.message'}`)
                }
              } else if (['boolean', 'number', 'string', 'object'].includes(typeof oldValue)) {
                switch (true) {
                  case scenarioItem.targetActionCode === 'set_random_integer': {
                    const __val = getRandomInteger(1000, 9999)
                    logs.unshift(`🟢 case 2.3.1 set_random_integer: "${scenarioItem.targetMutationPath}" -> ${__val}`)
                    setNestedValue(targetResponse.data, scenarioItem.targetMutationPath, __val)
                    break
                  }
                  case scenarioItem.targetActionCode === 'set_null':
                    logs.unshift(`🟢 case 2.3.2 set_null: "${scenarioItem.targetMutationPath}" -> null`)
                    setNestedValue(targetResponse.data, scenarioItem.targetMutationPath, null)
                    break
                  case scenarioItem.targetActionCode === 'set_random_string': {
                    const __val = getRandomString(5)
                    logs.unshift(`🟢 case 2.3.3 set_random_string: "${scenarioItem.targetMutationPath}" -> ${__val}`)
                    setNestedValue(targetResponse.data, scenarioItem.targetMutationPath, __val)
                    break
                  }
                  default:
                    break
                }
              } else {
                logs.unshift('case 2.2 ⭕ Element not modified')
              }
              break
            }
          default:
            break
        }
        _c2 += 1
      }
    } catch (err) {
      logs.unshift(`🔴 ${err?.message || 'Предположительно, ошибка парсинга'}`)
      // - NOTE: Добавим стандартную логику
      switch (true) {
        case !!_responseDelay: {
          const delay = Number(_responseDelay)
          return setTimeout(() => {
            res.status(!!_setStatus ? Number(_setStatus) : 200).send({ ...targetResponse, logs })
          }, delay)
        }
        default:
          return res.status(!!_setStatus ? Number(_setStatus) : 200).send({ ...targetResponse, logs })
      }
      // -
    }
    // ---
    // --

    switch (true) {
      case !!_responseDelay: {
        const delay = Number(_responseDelay)
        return setTimeout(() => {
          res.status(!!_setStatus ? Number(_setStatus) : 200).send({ ...targetResponse, logs })
        }, delay)
      }
      default:
        // v1
        return res.status(!!_setStatus ? Number(_setStatus) : 200).send({ ...targetResponse, logs })
    }
  } catch (err) {
    try {
      const targetResponse = {
        success: false,
        status: 'Fail',
        requestId: '00000000-0000-0000-abcd-000000000013',
        message: err.message || 'No err message',
      }
      // -- NOTE: Пробуем мутировать
      const { query: { _addData, _responseDelay } } = req;
      if (!!_addData) {
        const json = JSON.parse(decodeURIComponent(_addData))
        if (!!json && typeof json === 'object' && Object.keys(json).length > 0)
          mutateObject({ target: targetResponse, source: json })
      }
      switch (true) {
        case !!_responseDelay: {
          const delay = !Number.isNaN(Number(_responseDelay)) ? Number(_responseDelay) : 0
          return setTimeout(() => res.status(!!req.query?._setStatus ? Number(req.query?._setStatus) : 500).send(targetResponse), delay)
        }
        default:
          return res.status(!!req.query?._setStatus ? Number(req.query?._setStatus) : 500).send(targetResponse)
      }
      // --
    } catch (err) {
      res.status(500).send({
        success: false,
        status: 'Fail',
        requestId: '00000000-0000-0000-abcd-000000000013',
        message: err.message || 'No err message',
      })
    }
  }
}
