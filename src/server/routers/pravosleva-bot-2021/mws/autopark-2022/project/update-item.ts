import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'

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

const requiredFields = ['chat_id', 'project_id', 'item']
const requiredItemFields = ['id', 'name', 'description', 'mileage']

export const updateAutoparkProjectItem = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { chat_id, project_id, item: { id, name, description, mileage: { delta, last } } } = req.body

  const errs = []
  for (const key of requiredFields) if (!req.body[key]) errs.push(`${key} is required!`)
  if (!!req.body.item) {
    for (const key of requiredItemFields) if (!req.body.item[key]) errs.push(`${key} is required!`)
  }
  if (errs.length > 0) {
    return res.status(200).send({
      ok: false,
      code: EAPIUserCode.IncorrecrBody,
      message: errs.join('; '),
      _originalBody: req.body,
    })
  }

  if (!req.body.item?.mileage?.delta || !req.body.item?.mileage?.last) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrBody,
      _originalBody: { body: req.body },
    })
  }

  if (!!req.autopark2022StorageFilePath) {
    try {
      const staticData: TStaticData = getStaticJSONSync(req.autopark2022StorageFilePath)
      const ts = new Date().getTime()
      const oldProjects = !!staticData[String(chat_id)] ? staticData[String(chat_id)].projects : {}
      const myNewData: TUserData = { ...staticData[String(chat_id)], projects: oldProjects }

      // -- NOTE: Replace target item
      if (!myNewData?.projects[project_id]) {
        return res.status(200).json({ ok: false, code: EAPIUserCode.NotFound, message: 'Project not found' })
      } else {
        // myNewData.projects[project_id].items.push({ ...req.body.item, id: ts })
        myNewData.projects[project_id].items = myNewData.projects[project_id].items.filter(({ id }) => id !== req.body.item.id)
        myNewData.projects[project_id].items.push(req.body.item)
      }
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
