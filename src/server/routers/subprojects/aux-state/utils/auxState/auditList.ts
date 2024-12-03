// import express, { Response as IResponse, NextFunction as INextFunction } from 'express'
// import { TModifiedRequest } from '~/routers/subprojects/aux-state/types'
import { getStaticJSONSync } from '~/utils/fs-tools'
import path from 'path'
import { NAuditList } from '~/routers/subprojects/aux-state/types'

type TGlobalStateFormat = Map<number, NAuditList.TAudit[]>

type TState = {
  data: {
    [key: string]: NAuditList.TAudit[];
  };
  ts: number;
}

class Singleton {
  private static instance: Singleton;
  state: TGlobalStateFormat;
  rootStorageFile: string;

  private constructor({ rootStorageFile }: {
    rootStorageFile: string;
  }) {
    this.rootStorageFile = rootStorageFile
    this.state = new Map()
    // NOTE: Init cache
    try {
      const json: TState = getStaticJSONSync<TState | null>(this.rootStorageFile, null)

      if (!json) throw new Error('Неожиданное содержимое файла')

      for (const key in json.data) this.state.set(Number(key), json.data[key])
    } catch (err: any) {
      console.log(err)
      throw new Error(`⛔ Что-то пошло не так: ${err?.message || 'No err?.message'}`)
    }
  }

  public static getInstance({ rootStorageFile }: {
    rootStorageFile: string;
  }): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton({ rootStorageFile });

    return Singleton.instance;
  }

  public keys() {
    return this.state.keys()
  }
  public get size() {
    return this.state.size
  }
  public set(key: number, value: NAuditList.TAudit[]) {
    this.state.set(key, value)
  }
  public get(key: number) {
    return this.state.get(key)
  }
  public delete(key: number) {
    return this.state.delete(key)
  }
  public has(key: number) {
    return this.state.has(key)
  }

  public getState(): {
    [key: string]: NAuditList.TAudit[];
  } {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[String(key)] = value
    })

    return state
  }
  public replaceAuditItem({ tg_chat_id, audit }: {
    tg_chat_id: number;
    audit: NAuditList.TAudit;
  }): Promise<{
    ok: boolean;
    instance: Singleton;
  }> {
    const userState = this.state.get(tg_chat_id)

    if (!userState) this.state.set(tg_chat_id, [audit])
    else {
      const targetIndex = userState.findIndex(({ id }) => id === audit.id)
      const isExists = targetIndex !== -1

      if (!isExists) this.state.set(tg_chat_id, [...userState, audit])
      else {
        userState[targetIndex] = audit
        this.state.set(tg_chat_id, userState)
      }
    }
    return Promise.resolve({
      ok: true,
      instance: this,
    })
  }
  public removeAuditItem({ tg_chat_id, auditId }: {
    tg_chat_id: number;
    auditId: string;
  }) {
    const userState = this.state.get(tg_chat_id)

    if (!userState) return Promise.reject({ ok: false, message: 'User space not found' })
    else {
      const targetIndex = userState.findIndex(({ id }) => id === auditId)
      const isExists = targetIndex !== -1

      if (!isExists) return Promise.reject({ ok: false, message: 'Audit not found' })
      else {
        this.state.set(tg_chat_id, userState.filter(({ id }) => id !== auditId))
      }
    }
    return Promise.resolve({
      ok: true,
      instance: this,
    })
  }
}

const projectRootDir = path.join(__dirname, '../../../../../../') // NOTE: root ./src как ориентир
const getFileName = (namespace: string): string => `subprojects.${namespace}.aux-state.json`
const getStorageNamespaceFilePath = (namespace: string): string => path.join(projectRootDir, '/storage', getFileName(namespace))

export const auditListAuxStateInstance = Singleton.getInstance({ rootStorageFile: getStorageNamespaceFilePath('audit-list') })
export type TAuditListAuxStateInstance = typeof auditListAuxStateInstance
