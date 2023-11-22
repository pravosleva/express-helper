import { Response as IResponse, Request as IRequest } from 'express'
// @ts-ignore
// import { getRandomInteger } from '~/utils/getRandomInteger'
import { THelp } from '~/utils/express-validation/interfaces'

// const { SUCCESS_ANYWAY } = process.env

export const rules: THelp = {
  params: {
    body: {
      _addData: {
        type: 'object',
        descr: 'Additional data for response',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'object':
              result.ok = false
              result.reason = 'req.body.addData shoud be an object'
              // @ts-ignore
              result._reponseDetails = {
                status: 401,
              }
              break
            case Object.keys(val).length === 0:
              result.ok = false
              result.reason = 'req.body.addData shoud not be empty'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      _customResponseStatus: {
        type: 'number',
        descr: 'Response status',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'number':
              result.ok = false
              result.reason = 'req.body._customResponseStatus shoud be a number'
              break
            // NOTE: See also https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
            case val < 200 || val > 599:  
              result.ok = false
              result.reason = 'req.body._customResponseStatus shoud have value like this https://developer.mozilla.org/en-US/docs/Web/HTTP/Status'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
    }
  }
}

export const me = async (req: IRequest, res: IResponse) => {
  const { _addData } = req.body
  const result = {
    ok: true,
  }
  if (!!_addData) for (const key in _addData) result[key] = _addData[key]

  setTimeout(() => {
    return res.status(200).send(result)
  }, 1000)
}
