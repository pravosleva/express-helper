import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { THelp } from '~/utils/express-validation'

import v12 from './data/pravosleva.v12.json'
import v11 from './data/pravosleva.v11.json'
import sample_incorrect_0 from './data/incorrect.0.json'
import { getTargetFirst } from '~/utils/family-tree/v2023/getTargetFirst'
import { testTextByAnyWord } from '~/utils/string-ops'
// import example from './data/average-sample.json'

const versions = {
  '12': v12,
  '11': v11,
  // '10': v10,
  // '9': v9,
  // '0': example,
  'incorrect-0': sample_incorrect_0,
}

export const rules: THelp = {
  params: {
    query: {
      v: {
        type: 'string',
        descr: 'Family Tree json version',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query.v shoud be not empty string'
              break
            case !versions[String(val)]:
              result.ok = false
              result.reason = 'Oops! No this version'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      target: {
        type: 'string',
        descr: 'Target family in head of the Family Tree (in any register)',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query.target shoud be not empty string (but isnt required param)'
              break
            case !/^[a-zA-Z]+$/.test(val):
              result.ok = false
              result.reason = 'req.query.target shoud have letters only (numbers is not allowed)'
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

const cache: {
  [key: string]: {
    data: any;
    ts: number;
  };
} = {}
const maxKeysLen = 2
const isTsActual = ({ limit, ts }) => {
  const nowTs = new Date().getTime()
  return nowTs - ts <= limit
}
const cacheLimit = 5 * 1000

export const getPravoslevaPersons = (req: IRequest, res: IResponse, _next: INextFunction) => {
  const { v, target } = req.query
  // @ts-ignore
  const normalizedTarget = !!target ? target.toLowerCase() : undefined
  const key = String(v)

  if (!!versions[key]) {
    switch (true) {
      case !!normalizedTarget && typeof target === 'string': {
        if (
          // @ts-ignore
          !!cache[normalizedTarget]?.data
          // @ts-ignore
          && !!cache[normalizedTarget]?.ts
          && isTsActual({ ts: new Date().getTime(), limit: cacheLimit })
          // @ts-ignore
        ) return res.status(200).send(cache[normalizedTarget].data)
        else {
          // @ts-ignore
          if (Object.keys(cache).length > maxKeysLen && !!cache[normalizedTarget]) delete cache[normalizedTarget]

          // @ts-ignore
          cache[normalizedTarget] = {
            data: getTargetFirst({
              nodes: versions[key],
              // @ts-ignore
              target: normalizedTarget,
              // @ts-ignore
              validate: ({ id }) => testTextByAnyWord({ words: [normalizedTarget], text: id }),
            }),
            ts: new Date().getTime(),
          }
          // @ts-ignore
          return res.status(200).send(cache[normalizedTarget].data)
        }
      }
      default:
        return res.status(200).send(versions[key])
    }
  }
  else return res.status(500).send({ ok: false, message: `Version "${v}" not found` })
}
