import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import jwt from 'jsonwebtoken'

const jwtSecret = 'super-secret'
const jwtCookieName = 'autopark-2022.jwt'

type TItem = {
  id: number;
  name: string;
  description: string;
  mileage: {
    delta: number;
    last: number;
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

export const createAutoparkProjectItem = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { chat_id, project_id, item: { name, description, mileage: { delta, last } } } = req.body

  if (!chat_id || !project_id || !req.body.item?.name || !description || !req.body.item.mileage?.delta || !req.body.item.mileage?.last) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrBody,
      _originalBody: { body: req.body },
    })
  }

  // -- NOTE: tmp user check
  if (!req.cookies || !req.cookies[jwtCookieName]) {
    return res.status(401).send({
      success: false,
      message: 'Try to login',
      _originalParams: { params: req.params },
    })
  } else {
    const jwtParsed: any = jwt.verify(req.cookies[jwtCookieName], jwtSecret)

    if (typeof jwtParsed?.chat_id !== 'string' || jwtParsed?.chat_id !== req.body.chat_id) {
      return res.status(401).send({
        success: false,
        message: 'It\'s not your progect',
        _originalParams: { params: req.params },
      })
    }
  }
  // --

  if (!!req.autopark2022StorageFilePath) {
    try {
      res.startTime('read_storage_file_sync', req.autopark2022StorageFilePath)
      const staticData: TStaticData = getStaticJSONSync<any>(req.autopark2022StorageFilePath, {})
      res.endTime('read_storage_file_sync')
      const ts = new Date().getTime()
      const oldProjects = !!staticData[String(chat_id)] ? staticData[String(chat_id)].projects : {}
      const myNewData: TUserData = { ...staticData[String(chat_id)], projects: oldProjects }

      // -- NOTE: Add item
      if (myNewData?.projects[project_id])
        myNewData.projects[project_id].items.push({ ...req.body.item, id: ts })
      // --

      staticData[String(chat_id)] = { ...myNewData, ts }

      writeStaticJSONAsync(req.autopark2022StorageFilePath, staticData)

      return res.status(200).json({ ok: true, staticData, code: EAPIUserCode.Created, projects: myNewData.projects })
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
