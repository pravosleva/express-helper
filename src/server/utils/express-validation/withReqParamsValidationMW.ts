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
    const errs: string[] = []

    for (const reqProp in rules.params) {
      switch (reqProp) {
        case 'body':
        case 'query':
          for (const key in rules.params[reqProp]) {
            if (rules.params[reqProp][key]?.required && !req[reqProp][key])
              errs.push(
                `Missing required param: \`req.${reqProp}.${key}\` (${rules.params[reqProp][key].type}: ${rules.params[reqProp][key].descr})`
              )
            else {
              try {
                const validationReult = rules.params[reqProp][key]?.validate(req[reqProp][key])
                if (!validationReult.ok) {
                  errs.push(
                    `Incorrect request param format: \`req.${reqProp}.${key}\` (${rules.params[reqProp][key].descr}) expected: ${rules.params[reqProp][key].type}, received: ${typeof req[reqProp][key]}${!!validationReult.reason ? ` ⚠️ by developer: ${validationReult.reason}` : ''}`
                  )
                }
              } catch (err) {
                errs.push(
                  `Не удалось проверить поле: \`req.${reqProp}.${key}\` (${rules.params[reqProp][key].descr}); ${typeof err === 'string' ? err : (err.message || 'No err.message')}`
                )
              }
            }
          }
          break
        default:
          break
      }
    }

    if (errs.length > 0)
      return res.status(400).send({
        ok: false,
        message: `⛔ ERR! ${errs.join('; ')}`,
        _service: {
          originalBody: req.body,
          originalQuery: req.query,
          rules,
        },
      })
    // --

    return next()
  }
