import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { getStaticJSONSync } from '~/utils/fs-tools'

type TProjectData = {
  name: string;
  description: string;
  items: any[];
}
type TUserData = {
  tg: {
    chat_id: number;
    username: string;
  },
  ts: number;
  password: number;
  projects?: {
    [key: string]: TProjectData
  }
}
type TStaticData = {
  [key: string]: TUserData
}

export const getUserProjects = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { tg } = req.body

  if (!tg) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrParams,
      _originalParams: { params: req.params },
    })
  }

  if (!!req.autopark2022StorageFilePath) {
    try {
      const { chat_id } = tg
  
      const staticData: TStaticData = getStaticJSONSync(req.autopark2022StorageFilePath)

      if (!staticData[String(chat_id)]) return res.status(200).json({
        ok: false,
        message: 'User does not exists',
        code: EAPIUserCode.NotFound,
      })

      const response: any = { ok: true }

      if (
        !!staticData[String(chat_id)]?.projects
        && Object.keys(staticData[String(chat_id)].projects).length > 0
      ) response.projects = staticData[String(chat_id)].projects
      else response.message = 'Пока нет проектов'

      return res.status(200).json(response)
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
