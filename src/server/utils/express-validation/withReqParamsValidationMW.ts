import {
  Request as IRequest,
  Response as IResponse,
  NextFunction as INextFunction,
} from 'express'
import { THelp } from './interfaces'

type TProps = {
  rules: THelp
}

export const withReqParamsValidationMW =
  ({ rules }: TProps) =>
  (req: IRequest, res: IResponse, next: INextFunction) => {
    // -- NOTE: Errs handler
    const errs: { msg: string, _reponseDetails?: any }[] = []

    for (const reqProp in rules.params) {
      switch (reqProp) {
        case 'body':
        case 'query':
          for (const key in rules.params[reqProp]) {
            if (rules.params[reqProp][key]?.required && !req[reqProp][key]) {
              const validationReult = rules.params[reqProp][key]?.validate(req[reqProp][key])
              const errOpts: any = {
                msg: `Missing required param: \`req.${reqProp}.${key}\` (${rules.params[reqProp][key].type}: ${rules.params[reqProp][key].descr})${!!validationReult.reason ? ` ⚠️ by developer: ${validationReult.reason}` : ''}`
              }
              
              if (!!validationReult._reponseDetails)
                errOpts._reponseDetails = validationReult._reponseDetails

              errs.push(errOpts)
            } else {
              try {
                const validationReult = rules.params[reqProp][key]?.validate(req[reqProp][key])

                if (!validationReult.ok) {
                  const errOpts: {
                    msg: string;
                    _reponseDetails?: {
                      status: number;
                      [key: string]: any;
                    }
                  } = {
                    msg: `Incorrect request param format: \`req.${reqProp}.${key}\` (${rules.params[reqProp][key].descr}) expected: ${rules.params[reqProp][key].type}, received: ${typeof req[reqProp][key]}${!!validationReult.reason ? ` ⚠️ by developer: ${validationReult.reason}` : ''}`,
                  }
                  if (!!validationReult._reponseDetails)
                    errOpts._reponseDetails = validationReult._reponseDetails

                  errs.push(errOpts)
                }
              } catch (err) {
                errs.push({
                  msg: `Не удалось проверить поле: \`req.${reqProp}.${key}\` (${rules.params[reqProp][key].descr}); ${typeof err === 'string' ? err : (err.message || 'No err.message')}`
                })
              }
            }
          }
          break
        default:
          break
      }
    }

    if (errs.length > 0) {
      let status = 400
      const result: any = {
        ok: false,
        message: `⛔ ERR! ${errs.map(({ msg }) => msg).join('; ')}`,
        _service: {
          originalBody: req.body,
          originalQuery: req.query,
          rules,
        }
      }

      // -- NOTE: Пробуем добавить детали первой ошибки результатов обработки в ответ (если они есть)
      try {
        if (!!errs[0]._reponseDetails) {
          const { status: _status, _addProps } = errs[0]._reponseDetails
          status = _status
          if (!!_addProps && Object.keys(_addProps).length > 0) {
            for (const key in _addProps) result[key] = _addProps[key]
          }
        }
      } catch (err) {
        result._service.message = typeof err === 'string' ? err : (err.message || 'No err.message')
      }
      // --
      
      return res.status(status).send(result)
    }
    // --

    return next()
  }
