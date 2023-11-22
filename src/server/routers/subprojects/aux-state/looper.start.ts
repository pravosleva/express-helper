import { Response as IResponse, NextFunction as INextFunction } from 'express'
import { TModifiedRequest } from './types'
import { THelp } from '~/utils/express-validation'
import { EStatus } from '~/utils/MakeLooper'
import { writeStaticJSONAsync } from '~/utils/fs-tools'
import { getStorageNamespaceFilePath } from './index'

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
    }
  }
}

export const looperStart = (req: TModifiedRequest, res: IResponse, _next: INextFunction) => {
  try {
    const oldLooperState = req.subprojects.loopers.getState({ namespace: req.body.namespace })
    if (oldLooperState === EStatus.STARTED)
      return res.status(200).send({
        ok: false,
        message: 'Looper already started',
      })

    req.subprojects.loopers.start({
      namespace: req.body.namespace,
      cb: () => {
        // console.log('--looper strated', req.body.namespace)
        // TODO: Sync file once here!
        const ts = new Date().getTime()
        const data = req.subprojects.auxState.auditList.getState()

        console.log('--run save file!')
        writeStaticJSONAsync(getStorageNamespaceFilePath(req.body.namespace), { data, ts })
      }
    })
    const newLooperState = req.subprojects.loopers.getState({ namespace: req.body.namespace })
    res.status(200).send({
      ok: true,
      _service: {
        state: req.subprojects.auxState.auditList.getState(),
      },
      message: `Switched ${oldLooperState} -> ${newLooperState}`,
    })
  } catch (err) {
    res.status(200).send({
      ok: false,
      _service: {
        state: req.subprojects.auxState.auditList.getState(),
      },
      message: `${err.message || 'No err.message'}, State: ${req.subprojects.loopers.getState({ namespace: req.body.namespace })}`,
    })
  }
}
