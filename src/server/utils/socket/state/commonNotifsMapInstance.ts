import path from 'path'
import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/counter'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
// import merge from 'merge-deep'
import merge2 from 'deepmerge'
import {
  TMessage,
  TUserName,
} from './types'
import { createFileIfNecessary } from '~/utils/fs-tools/createFileIfNecessary'

const counter = Counter()
const CHAT_COMMON_NOTIFS_MAP_FILE_NAME = process.env.CHAT_COMMON_NOTIFS_MAP_FILE_NAME || 'chat.common-notifs.json'
const projectRootDir = path.join(__dirname, '../../../../')
const storageCommonNotifsMapFilePath = path.join(projectRootDir, '/storage', CHAT_COMMON_NOTIFS_MAP_FILE_NAME)

createFileIfNecessary(storageCommonNotifsMapFilePath)

type TNotifItem = {
  ts: number
  username: TUserName
  tsTarget: number
  text: string
  original: TMessage
}
type TData = { [key: string]: TNotifItem }
type TRoomNotifs = {
  tsUpdate: number
  data: TData
}

class Singleton {
  private static instance: Singleton;
   state: Map<string, TRoomNotifs>;

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
  public set(key: string, value: TRoomNotifs) {
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

export const commonNotifsMapInstance = Singleton.getInstance()
const overwriteMerge = (_target, source, _options) => source
const mergeData = (oldData: { data: TData, tsUpdate: number }, freshData: { data: TData, tsUpdate: number }) => {
  // console.log('--- mergeData')
  // console.log('-- OLD:')
  // console.log(oldData)
  // console.log('-- NEW:')
  // console.log(freshData)
  // console.log('---')
  if (!!freshData?.data) {
    return freshData
  } else {
    return { ...oldData, ...freshData }
  }
}

const syncRegistryMap = () => {
  const isFirstScriptRun = counter.next().value === 0

  try {
    if (!!storageCommonNotifsMapFilePath) {
      let oldStatic: { data: { [key: string]: TRoomNotifs }, ts: number }
      try {
        oldStatic = getStaticJSONSync(storageCommonNotifsMapFilePath)
        // console.log(oldStatic.data)
        if (!oldStatic?.data || !oldStatic.ts) {
          console.log(oldStatic)
          throw new Error('#ERR2021122508:35 Incorrect static data')
        }
      } catch (err) {
        // TODO: Сделать нормальные логи
        console.log('ERR#CHAT.COMMON.NOTIFS')
        console.log(err)
        // oldStatic = { data: {}, ts: 0 }
        process.exit(1)
      }
      const staticData: { [key: string]: TRoomNotifs } = oldStatic.data
      const ts = new Date().getTime()

      if (isFirstScriptRun) {
        // NOTE: Sync with old state:
        Object.keys(staticData).forEach((name: string) => {
          const modifiedState: TRoomNotifs = staticData[name]

          // -- NOTE: Ограничения по количеству хранимых токенов
          // ...
          // --
          
          commonNotifsMapInstance.set(name, modifiedState)
        })
      }

      const currentRegistryMapState: { [key: string]: TRoomNotifs } = [...commonNotifsMapInstance.keys()].reduce((acc, roomName: string) => { acc[roomName] = commonNotifsMapInstance.get(roomName); return acc }, {})
      
      // console.log('- 1')
      // console.log(currentRegistryMapState)
      
      // const newStaticData = merge(staticData, currentRegistryMapState)
      const newStaticData = merge2(staticData, currentRegistryMapState, {
        arrayMerge: overwriteMerge,
        customMerge: (_key: string) => {
          // console.log(key)
          // if (key === 'data') return mergeData
          return mergeData
        }
      })

      // console.log('- 2: merged')
      // console.log(newStaticData)

      writeStaticJSONAsync(storageCommonNotifsMapFilePath, { data: newStaticData , ts })
    } else {
      throw new Error(`#ERR2021122508:41 File not found: ${storageCommonNotifsMapFilePath}`)
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
  interval: 15000,
  callbackAsResolve: () => {
    syncRegistryMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---
