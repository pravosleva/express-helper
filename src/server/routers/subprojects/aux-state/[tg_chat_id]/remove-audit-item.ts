import { Response as IResponse } from 'express'
import { TModifiedRequest } from '../types'
import { THelp } from '~/utils/express-validation/interfaces'
import { NAuditList } from '~/routers/subprojects/aux-state/types'
import { ENamespace } from '../utils'

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
        },
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
      auditId: {
        type: 'string',
        descr: 'Audit ID for remove',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          switch (true) {
            case !val:
              result.ok = false
              result.reason = 'req.body.auditId should not be empty'
              break
            default:
              break
          }
          return result
        }
      },
    }
  }
}

export const removeAuditItem = (req: TModifiedRequest & {
  tg_chat_id: number;
  audit: NAuditList.TAudit;
}, res: IResponse) => {
  // NOTE: Все параметры пришли в корректном виде
  try {
    const {
      namespace, // tg_chat_id,
      auditId,
    } = req.body
    const { tg_chat_id: _tg_chat_id } = req.params
    const tg_chat_id = Number(_tg_chat_id)
    if (typeof tg_chat_id !== 'number') return res.status(200).send({
      ok: false,
      message: `tg_chat_id is ${typeof tg_chat_id} (should be number)`,
    })

    switch (req.body.namespace) {
      case ENamespace.AUDIT_LIST: {
        req.subprojects.auxState.auditList.removeAuditItem({
          tg_chat_id,
          auditId,
        })
        return res.status(200).send({
          ok: true,
          message: 'Deleted',
          // audit: req.subprojects.auxState.auditList.get(tg_chat_id),
        })
      }
      default:
        return res.status(200).send({
          ok: false,
          message: `Для ${namespace} кейса не существует`,
        })
    }
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: err.message || 'Не удалось добавить в кэш (No err.message)',
    })
  }
}
