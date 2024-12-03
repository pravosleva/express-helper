import { Request as IRequest, Response as IResponse, NextFunction as INextFunction } from 'express'
import { EAPIUserCode } from '~/routers/chat/mws/api/types';
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import jwt from 'jsonwebtoken'
import { THelp, TValidationResult } from '~/utils/express-validation/interfaces'

const projectItemValidator = (val: any): TValidationResult => {
  const res: TValidationResult = { ok: true }

  switch (true) {
    case !val?.id || typeof val.id !== 'number':
      res.ok = false
      res.reason = 'item.id should be number (is required)'
      res._reponseDetails._addProps = { code: EAPIUserCode.IncorrecrBody }
      break
    case !val?.name || typeof val.name !== 'string':
      res.ok = false
      res.reason = 'item.name should be not empty tring'
      res._reponseDetails._addProps = { code: EAPIUserCode.IncorrecrBody }
      break
    case !val?.mileage || typeof val.mileage.delta !== 'number' || typeof val.mileage.last !== 'number':
      res.ok = false
      res.reason = `Incorrect item.mileage (received: ${!!val?.mileage ? JSON.stringify(val.mileage) : typeof val?.mileage})`
      res._reponseDetails._addProps = { code: EAPIUserCode.IncorrecrBody }
      break
    default:
      break
  }

  return res
}
const projectItemsValidator = (val: any[]): TValidationResult => {
  const res: TValidationResult = { ok: true }

  switch (true) {
    case !Array.isArray(val):
      res.ok = false
      res.reason = 'items prop should be an Array'
      res._reponseDetails._addProps = { code: EAPIUserCode.IncorrecrBody }
      break
    default:
      // let finalResult = { ok: true }
      for (const item of val) {
        const validated = projectItemValidator(item)
        if (!validated.ok) {
          for (const key in validated) res[key] = validated[key]
          break
        }
      }
      break
  }

  return res
}
const projectDataValidator = (val: any): TValidationResult => {
  const res: TValidationResult = { ok: true }

  switch (true) {
    case !val.name:
      res.ok = false
      res.reason = 'name prop is required'
      res._reponseDetails._addProps = {
        code: EAPIUserCode.IncorrecrBody,
      }
      break
    case !!val.items:
      const validated = projectItemsValidator(val.items)
      for (const key in validated) res[key] = validated[key]
      break
    default: break
  }

  return res
}

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
              result.reason = 'req.body.chat_id should be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      project_id: {
        type: 'string',
        descr: 'Project id',
        required: true,
        validate: (val: any) => {
          const result: TValidationResult = { ok: true }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.project_id should be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      projectData: {
        type: 'nested object',
        descr: 'Project data',
        required: true,
        validate: (val: any) => projectDataValidator(val)
      },
    },
  },
}

const jwtSecret = 'super-secret'
const jwtCookieName = 'autopark-2022.jwt'

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
    [key: string]: TProject // NOTE: projectId as key
  }
}
type TStaticData = {
  [key: string]: TUserData
}

export const updateAutoparkProject = async (req: IRequest & { autopark2022StorageFilePath: string }, res: IResponse, next: INextFunction) => {
  const { chat_id, projectData, project_id } = req.body

  if (!chat_id || !project_id || !projectData || !projectData?.name) {
    return res.status(401).send({
      ok: false,
      code: EAPIUserCode.IncorrecrBody,
      _originalParams: { body: req.body },
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
      const staticData: TStaticData = getStaticJSONSync<TStaticData>(req.autopark2022StorageFilePath, {})
      const ts = new Date().getTime()
      const oldProjects = !!staticData[String(chat_id)] ? staticData[String(chat_id)].projects || {} : {}
      const myNewData: TUserData = { ...staticData[String(chat_id)], projects: oldProjects }
      // const projectId = new Date().getTime()
      const hasWithSameName = Object.keys(myNewData.projects).some((id: string) => myNewData.projects[id].name === projectData.name)

      if (hasWithSameName)
        return res.status(200).json({
          ok: false,
          staticData: chat_id === '432590698' ? staticData : null,
          code: EAPIUserCode.UserExists,
          message: `Проект ${projectData.name} уже существует`,
          projects: myNewData.projects,
        })

      myNewData.projects[project_id] = { ...projectData }

      staticData[String(chat_id)] = { ...myNewData, ts }

      writeStaticJSONAsync(req.autopark2022StorageFilePath, staticData)

      return res.status(200).json({
        ok: true,
        staticData: chat_id === '432590698' ? staticData : null,
        code: EAPIUserCode.Updated,
        projects: myNewData.projects,
      })
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
