import { Response as IResponse, NextFunction as INextFunction } from 'express'
import { TModifiedRequest } from './types'
import { THelp } from '~/utils/express-validation'
import { EStatus } from '~/utils/MakeLooper'
// import { writeStaticJSONAsync } from '~/utils/fs-tools'
// import { getStorageNamespaceFilePath } from './index'

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

export const looperStop = (req: TModifiedRequest, res: IResponse, _next: INextFunction) => {
  try {
    const oldLooperState = req.subprojects.loopers.getState({ namespace: req.body.namespace })
    if (oldLooperState === EStatus.STOPPED)
      return res.status(200).send({
        ok: false,
        _service: {
          state: req.subprojects.auxState.auditList.getState(),
        },
        message: 'Looper already stopped',
      })
    
    req.subprojects.loopers.stop({
      namespace: req.body.namespace,
    })
    // console.log('--looper stoped')
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
      message: `${err.message || 'No err.message'}, State: ${req.subprojects.loopers.getState({ namespace: req.body.namespace })}`,
    })
  }
}
