import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
// import { TModifiedRequest } from './types'
import { THelp } from '~/utils/express-validation'
// import { EStatus } from '~/utils/MakeLooper'
// import { writeStaticJSONAsync } from '~/utils/fs-tools'

export const rules: THelp = {
  params: {
    body: {
      id: {
        type: 'string',
        descr: 'person id',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.id shoud be not empty string'
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

type TPersonData = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

const persons: {
  [key: string]: TPersonData;
} = {
  'TsyAkbF89': {
    id: 'TsyAkbF89',
    firstName: 'Fst',
    middleName: 'Mddl',
    lastName: 'Lst',
  },
  'GEf8zF7A4': {
    id: 'GEf8zF7A4',
    firstName: 'Fst2',
    middleName: 'Mddl2',
    lastName: 'Lst2',
  },
}

export const getSinglePersonData = (req: IRequest, res: IResponse, _next: INextFunction) => {
  const { id } = req.body

  if (!!persons[id]) return res.status(200).send({ ok: true, data: persons[id] })
  else return res.status(200).send({ ok: false, message: 'Not found', data: { id } })
}
