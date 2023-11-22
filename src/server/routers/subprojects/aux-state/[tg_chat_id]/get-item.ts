import { Response as IResponse } from 'express'
import { TModifiedRequest } from '../types'
import { THelp } from '~/utils/express-validation/interfaces'
import { ENamespace } from '../utils'
import { sortArrayByKeys } from '~/utils/sort/sortArrayByKeys'

export const rules: THelp = {
  params: {
    body: {
      namespace: {
        type: 'string',
        descr: 'Namespace as filename substring',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.namespace shoud be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      tg_chat_id: {
        type: 'number',
        descr: 'tg_chat_id as room id',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          
          switch (true) {
            case typeof val !== 'number' || Number.isNaN(val):
              result.ok = false
              result.reason = `Should be number, received ${typeof val}`
              break
            // TODO: Others...
            default:
              break
          }
          return result
        },
      },
    }
  }
}

export const getItem = (req: TModifiedRequest & {
  namespace: string;
  tg_chat_id: number;
}, res: IResponse) => {
  // NOTE: Все параметры пришли в корректном виде
  const { namespace } = req.body
  const { tg_chat_id: _tg_chat_id } = req.params
  const tg_chat_id = Number(_tg_chat_id)

  if (typeof tg_chat_id !== 'number') return res.status(200).send({
    ok: false,
    message: `tg_chat_id is ${typeof tg_chat_id} (should be number)`,
  })

  switch (req.body.namespace) {
    case ENamespace.AUDIT_LIST:
      return res.status(200).send({
        ok: true,
        audits: req.subprojects.auxState.auditList.has(tg_chat_id)
          ? sortArrayByKeys({
            arr: req.subprojects.auxState.auditList.get(tg_chat_id),
            keys: ['tsCreate'],
            order: 1,
          }) : null,
        // _service: {
        //   state: req.subprojects.auxState.auditList.getState(),
        // },
      })
    default:
      return res.status(200).send({
        ok: false,
        message: `Для ${namespace} кейса не существует`,
      })
  }
}
