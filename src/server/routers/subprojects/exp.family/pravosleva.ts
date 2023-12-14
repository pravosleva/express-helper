import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { THelp } from '~/utils/express-validation'

import v8 from './data/pravosleva.v8.json'
import v7 from './data/pravosleva.v7.json'
import v6 from './data/pravosleva.v6.json'
import v5 from './data/pravosleva.v5.json'
import v4 from './data/pravosleva.v4.json'
import v3 from './data/pravosleva.v3.json'
import v2 from './data/pravosleva.v2.json'
import v1 from './data/pravosleva.v1.json'
import sample_incorrect_0 from './data/incorrect.0.json'
import example from './data/average-sample.json'

export const rules: THelp = {
  params: {
    query: {
      v: {
        type: 'string',
        descr: 'json version',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query.version shoud be not empty string'
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

const versions = {
  '8': v8,
  '7': v7,
  '6': v6,
  '5': v5,
  '4': v4,
  '3': v3,
  '2': v2,
  '1': v1,
  '0': example,
  'incorrect-0': sample_incorrect_0,
}

export const getPravoslevaPersons = (req: IRequest, res: IResponse, _next: INextFunction) => {
  const { v } = req.query
  const key = String(v)

  if (!!versions[key]) return res.status(200).send(versions[key])
  else return res.status(500).send({ ok: false, message: `Version "${v}" not found` })
}
