import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { getStaticJSONSync } from '~/utils/fs-tools'

type TItem = {
  name: string;
  description: string;
  mileage: {
    last?: number;
    delta?: number;
  },
  id: number;
}
type TProject = {
  name: string;
  description: string;
  items: TItem[];
}
type TUserData = {
  tg: {
    chat_id: number;
  },
  ts: number;
  password: number;
  projects: TProject[]
}
type TStaticData = {
  [key: string]: TUserData
}

// const getIsProjectValid = (v: TProject): boolean => {
//   let res = true
//   switch (true) {
//     case !v.name:
//       res = false
//       break
//     default:
//       break
//   }
//   return res
// }

export const getAutoparkProject = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { chat_id, project_id } = req.body

  if (!chat_id || !project_id) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrBody,
      _originalBody: { body: req.body },
    })
  }

  if (!!req.autopark2022StorageFilePath) {
    try {
      res.startTime('read_storage_file_sync', req.autopark2022StorageFilePath)
      const staticData: TStaticData = getStaticJSONSync<TStaticData>(req.autopark2022StorageFilePath, {})
      res.endTime('read_storage_file_sync')

      if (!staticData[chat_id]) {
        return res.status(200).json({ ok: false, code: EAPIUserCode.NotFound })
      }
      else if (!staticData[chat_id]?.projects[project_id]) {
        return res.status(200).json({ ok: false, code: EAPIUserCode.NotFound })
      }

      // -- NOTE: Sort by ts update
      const __staticData = staticData[chat_id]?.projects[project_id] || null;
      if (!!__staticData) {
        const sortedProjectDataItems = __staticData.items.sort((e1, e2) => (e2.mileage.last || 0) - (e1.mileage.last || 0))
        __staticData.items = sortedProjectDataItems
      }
      // --

      return res.status(200).json({ ok: true, projectData: __staticData, code: EAPIUserCode.UserExists })
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        ok: false,
        message: (err as Error)?.message || 'No err.message',
        _originalParams: { params: req.params },
        code: EAPIUserCode.ServerError,
      })
    }
  }
  next()
}
