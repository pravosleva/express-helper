import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import { THelp, TValidationResult } from '~/utils/express-validation/interfaces'

export const rules: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'string',
        descr: 'TG chat_id',
        required: true,
        validate: (val: any) => {
          const result: TValidationResult = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.chat_id should be number + not zero'
              result._reponseDetails._addProps = {
                code: EAPIUserCode.IncorrecrBody,
              }
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      name: {
        type: 'string',
        descr: 'Project name',
        required: true,
        validate: (val: any) => {
          const result: TValidationResult = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.name should be not empty string'
              result._reponseDetails._addProps = {
                code: EAPIUserCode.IncorrecrBody,
              }
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      description: {
        type: 'string',
        descr: 'Project description',
        required: false,
        validate: (val: any) => {
          const result: TValidationResult = { ok: true }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.description should be string (optional)'
              result._reponseDetails._addProps = {
                code: EAPIUserCode.IncorrecrBody,
              }
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
    },
  },
}

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
  projects: {
    [key: string]: TProject; // NOTE: projectId as key
  }
}
type TStaticData = {
  [key: string]: TUserData;
}

export const createAutoparkProject = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { chat_id, name, description } = req.body

  if (!!req.autopark2022StorageFilePath) {
    try {
      res.startTime('read_storage_file_sync', req.autopark2022StorageFilePath)
      const staticData: TStaticData = getStaticJSONSync<TStaticData>(req.autopark2022StorageFilePath, {})
      res.endTime('read_storage_file_sync')
      const ts = new Date().getTime()
      const oldProjects = !!staticData[String(chat_id)] ? staticData[String(chat_id)].projects || {} : {}
      const myNewData: TUserData = { ...staticData[String(chat_id)], projects: oldProjects }
      const projectId = new Date().getTime()
      const hasWithSameName = Object.keys(myNewData.projects).some((id: string) => myNewData.projects[id].name === name)

      if (hasWithSameName)
        return res.status(200).json({
          ok: false,
          staticData: chat_id === '432590698' ? staticData : null,
          code: EAPIUserCode.UserExists,
          message: `Проект ${name} уже существует`,
          projects: myNewData.projects,
        })

      myNewData.projects[projectId] = ({ name, description: description || '', items: [] })

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
