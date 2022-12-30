import path from 'path'
import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/counter'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import merge from 'merge-deep'
import {
  TUserName,
  TConnectionData,
} from './types'

const counter = Counter()
const CHAT_TG_IDS_MAP_FILE_NAME = process.env.CHAT_TG_IDS_MAP_FILE_NAME || 'chat.tg-chat-ids.json'
const projectRootDir = path.join(__dirname, '../../../../')
const storageTGChatIdsMapFilePath = path.join(projectRootDir, '/storage', CHAT_TG_IDS_MAP_FILE_NAME)

class Singleton {
  private static instance: Singleton;
   state: Map<string, TUserName>;

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
  public get size() {
    return this.state.size
  }
  public set(key: string, value: string) {
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

  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[String(key)] = value
    })

    return state
  }
}

export const registeredTGChatIdsMapInstance = Singleton.getInstance()

const syncRegistryMap = () => {
  const isFirstScriptRun = counter.next().value === 0

  try {
    if (!!storageTGChatIdsMapFilePath) {
      let oldStatic: { data: { [key: string]: string }, ts: number }
      try {
        oldStatic = getStaticJSONSync(storageTGChatIdsMapFilePath)
        if (!oldStatic?.data || !oldStatic.ts) {
          console.log(oldStatic)
          throw new Error('#ERR2021121816:03 Incorrect static data')
        }
      } catch (err) {
        // TODO: Сделать нормальные логи
        console.log('ERR#CHAT.SOCKET_121.1')
        console.log(err)
        // oldStatic = { data: {}, ts: 0 }
        process.exit(1)
      }
      const staticData = oldStatic.data
      const ts = new Date().getTime()

      if (isFirstScriptRun) {
        // NOTE: Sync with old state:
        Object.keys(staticData).forEach((name: string) => {
          const modifiedState = staticData[name]

          // -- NOTE: Ограничения по количеству хранимых токенов
          // ...
          // --
          
          registeredTGChatIdsMapInstance.set(name, modifiedState)
        })
      }

      const currentRegistryMapState: { [key: string]: TConnectionData } = [...registeredTGChatIdsMapInstance.keys()].reduce((acc, userName: string) => { acc[userName] = registeredTGChatIdsMapInstance.get(userName); return acc }, {})
      const newStaticData = merge(staticData, currentRegistryMapState)

      writeStaticJSONAsync(storageTGChatIdsMapFilePath, { data: newStaticData, ts })
    } else {
      throw new Error(`#ERR2021121816:03 File not found: ${storageTGChatIdsMapFilePath}`)
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
  interval: 10 * 60 * 1000, // 10 min
  callbackAsResolve: () => {
    syncRegistryMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---
