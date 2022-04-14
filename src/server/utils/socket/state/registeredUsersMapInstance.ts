import path from 'path'
import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/counter'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import merge from 'merge-deep'
import {
  TRegistryData,
  TUserName,
  ERegistryLevel,
  TConnectionData,
} from './types'

const counter = Counter()
const CHAT_PASSWORD_HASHES_MAP_FILE_NAME = process.env.CHAT_PASSWORD_HASHES_MAP_FILE_NAME || 'chat.passwd-hashes.json'
const projectRootDir = path.join(__dirname, '../../../../')
const storageRegistryMapFilePath = path.join(projectRootDir, '/storage', CHAT_PASSWORD_HASHES_MAP_FILE_NAME)

export const tokensLimit = 2

class Singleton {
  private static instance: Singleton;
   state: Map<TUserName, TRegistryData>;

  private constructor() {
    this.state = new Map()
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();

    return Singleton.instance;
  }

  public keys() {
    return this.state.keys()
  }
  public set(key: string, value: TRegistryData) {
    this.state.set(key, value)
  }
  public get(key: string) {
    return this.state.get(key)
  }
  public delete(key: string) {
    return this.state.delete(key)
  }
  public has(key: string) {
    return this.state.has(key)
  }
  public getUsers(searchText: string) {
    let result = []

    try {
      const words = searchText?.toLowerCase().split(' ').filter((str: string) => !!str)

      if (!!words) {
        for (let [key, userData] of this.state) {
          // console.log(key, userData)

          if (
            userData.registryLevel > 0
            && new RegExp(words.join("|"), 'gi').test(key)
          ) {
            result.push(key)
          }
        }

        // -- exception =)
        const exceptUsers: string[] = [
          'pavel64'
        ].filter((name) => new RegExp(words.join("|"), 'gi').test(name))

        if (exceptUsers.length > 0) result = result.concat(exceptUsers)
        // --
      }
    } catch (err) {
      console.log('-- ERR:')
      console.log(err)
    }

    return [...new Set(result)]
  }
}

export const registeredUsersMapInstance = Singleton.getInstance()

const syncRegistryMap = () => {
  const isFirstScriptRun = counter.next().value === 0

  try {
    if (!!storageRegistryMapFilePath) {
      let oldStatic: { data: { [key: string]: { passwordHash: string, registryLevel?: ERegistryLevel, tokens?: string[] } }, ts: number }
      try {
        oldStatic = getStaticJSONSync(storageRegistryMapFilePath)
        if (!oldStatic?.data || !oldStatic.ts) throw new Error('ERR#CHAT.SOCKET_121.2: incorrect static data')
      } catch (err) {
        // TODO: Сделать нормальные логи
        console.log('ERR#CHAT.SOCKET_121.1')
        console.log(err)
        oldStatic = { data: {}, ts: 0 }
      }
      const staticData = oldStatic.data
      const ts = new Date().getTime()

      if (isFirstScriptRun) {
        // NOTE: Sync with old state:
        Object.keys(staticData).forEach((name: string) => {
          const modifiedState = staticData[name]

          // -- NOTE: Ограничения по количеству хранимых токенов
          if (!!modifiedState.tokens) {
            // NOTE: Old trash
            // const numberToRemove = tokensLimit // - modifiedState.tokens.length
            // modifiedState.tokens = modifiedState.tokens.splice(0, numberToRemove)

            delete modifiedState.tokens
          }
          // --
          
          registeredUsersMapInstance.set(name, modifiedState)
        })
      }

      const currentRegistryMapState: { [key: string]: TConnectionData } = [...registeredUsersMapInstance.keys()].reduce((acc, userName: string) => { acc[userName] = registeredUsersMapInstance.get(userName); return acc }, {})
      const newStaticData = merge(staticData, currentRegistryMapState)

      writeStaticJSONAsync(storageRegistryMapFilePath, { data: newStaticData, ts })
    } else {
      throw new Error(`ERR#CHAT.SOCKET_122: файл не найден: ${storageRegistryMapFilePath}`)
    }
  } catch (err) {
    // TODO: Сделать нормальные логи
    console.log(err)
  }
}

// NOTE: Start polling
createPollingByConditions({
  cb: () => {
    console.log('cb called')
  },
  interval: 5 * 60 * 1000,
  callbackAsResolve: () => {
    syncRegistryMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---
