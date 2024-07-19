import {
  Request as IRequest,
  Response as IResponse,
  NextFunction as INextFunction,
} from 'express'
import { mutateObject } from '~/utils/mutateObject'

export const withAddDataToResponseMW = (req: IRequest & { _modifiedResult: any }, _res: IResponse, next: INextFunction) => {
  const { _add_data } = req.body
  req._modifiedResult = {}

  if (
    !!_add_data
    && typeof _add_data === 'object'
    && Object.keys(_add_data).length > 0
  )
    mutateObject({ target: req._modifiedResult, source: _add_data })
  
  next()
}
