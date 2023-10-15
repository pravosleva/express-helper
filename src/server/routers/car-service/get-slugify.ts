import { Request as IRequest, Response as IResponse } from 'express'
import slugify from 'slugify'
import { TValidationResult } from '~/utils/express-validation'

export const rules = {
  params: {
    body: {
      text: {
        type: 'string',
        descr: 'Target input text',
        required: true,
        validate: (val: any) => {
          const result: TValidationResult = {
            ok: true,
          }
          
          switch (true) {
            case !val:
              result.ok = false
              result.reason = 'Ожидается непустая строка'
              break
            default:
              break
          }
          result._reponseDetails = {
            status: 200,
          }
          return result
        }
      }
    }
  }
}

export const getSlugify = (req: IRequest, res: IResponse) => {
  const { text } = req.body
  const _result: any = {
    ok: true,
  }

  try {
    // @ts-ignore
    _result.result = slugify(text)
    return res.status(200).json({
      ok: true,
      ..._result,
    })
  } catch (err) {
    return res.status(200).json({
      ok: false,
      message: err?.message || 'No err.message',
    })
  }
}
