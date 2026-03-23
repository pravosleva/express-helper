// import { THelp } from '~/utils/interfaces'
import { THelp } from '~/utils/express-validation/interfaces'
import { mutateObject } from '~/utils/object-ops/mutateObject'
import { getIsExistsAndNumber } from '~/utils/string-ops';

export const dataProcessingAgreementSpecialMethodRules: THelp = {
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

export const dataProcessingAgreementSpecialMethod = (req, res) => {
  try {
    const { query: { _addData, _setStatus, _responseDelay } } = req;
    const targetResponse = {
      status: 'Success',
      data: {
        dmsDataProcessingAgreementID: 1,
        dmsPersonID: 1,
        createDate: '2020-01-01', // NOTE: Предполагаю
      }
    }

    if (_setStatus === '500')
      throw new Error('Frontend wants to have 500')

    if (!!_addData) {
      // NOTE: Alredy validated
      const json = JSON.parse(decodeURIComponent(_addData))

      // -- NOTE: Mutate result if necessary
      if (!!json && typeof json === 'object' && Object.keys(json).length > 0)
        mutateObject({ target: targetResponse, source: json })
      // --
    }

    switch (true) {
      case getIsExistsAndNumber(_responseDelay): {
        const delay = Number(_responseDelay)
        return setTimeout(() => {
          res.status(!!_setStatus ? Number(_setStatus) : 200).send(targetResponse)
        }, delay)
      }
      default:
        // v1
        return res.status(!!_setStatus ? Number(_setStatus) : 200).send(targetResponse)
    }
  } catch (err) {
    res.status(500).send({
      status: 'Fail',
      requestId: '00000000-0000-0000-abcd-000000000010',
      message: err.message || 'No err message',
    })
  }
}
