import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
// import { mutateReqIfLogged } from '~/routers/chat/mws/api/auth/mutate-req-if-logged.middle';
import { EAPIUserCode } from '~/routers/chat/mws/api/types'
import { getStaticJSONSync } from '~/utils/fs-tools'
import { sort } from '~/utils/sort-array-objects@3.0.0'

const getReport = ({ projectData, current_mileage }: { projectData: TProject, current_mileage: number }) => {
  const reportlist = projectData.items.map(({ mileage, ...rest }) => ({
    ...rest,
    mileage,
    diff: (mileage.last + mileage.delta) - current_mileage
  }))

  // for (const item of projectData.items) {}

  return sort(reportlist, ['diff', 'id'])
}

type TItem = {
  id: number;
  name: string;
  description: string;
  mileage: {
    last: number;
    delta: number;
  }
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
  projects: { [key: string]: TProject }
}
type TStaticData = {
  [key: string]: TUserData
}

export const getProjectReport = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { chat_id, project_id, current_mileage } = req.body

  if (!chat_id || !project_id || !current_mileage) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrBody,
      _originalBody: { body: req.body },
    })
  }

  if (!!req.autopark2022StorageFilePath) {
    try {
      res.startTime('read_storage_file_sync_1', 'Read static file')
      const staticData: TStaticData = getStaticJSONSync<TStaticData>(req.autopark2022StorageFilePath, {})
      res.endTime('read_storage_file_sync_1')
      res.setMetric('db', 100.0, 'Database metric');
      const userData: TUserData = staticData[String(chat_id)]
      const projectData: TProject | null = userData?.projects[project_id] || null

      // -- NOTE: Add item
      let report = null
      if (!!projectData) {
        report = getReport({ projectData, current_mileage })
      }
      // --

      return res.status(200).json({ ok: true, report })
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        ok: false,
        message: err.message || 'No err.message',
        _originalParams: { params: req.params },
        code: EAPIUserCode.ServerError,
      })
    }
  }
  next()
}
