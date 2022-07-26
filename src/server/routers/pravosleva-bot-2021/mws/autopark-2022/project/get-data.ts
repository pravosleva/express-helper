import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { getStaticJSONSync } from '~/utils/fs-tools'

type TItem = {
  name: string;
  description: string;
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
      const staticData: TStaticData = getStaticJSONSync(req.autopark2022StorageFilePath)

      if (!staticData[chat_id]) {
        return res.status(200).json({ ok: false, code: EAPIUserCode.NotFound })
      }
      else if (!staticData[chat_id]?.projects[project_id]) {
        return res.status(200).json({ ok: false, code: EAPIUserCode.NotFound })
      }

      return res.status(200).json({ ok: true, projectData: staticData[chat_id]?.projects[project_id] || null, code: EAPIUserCode.UserExists })
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
