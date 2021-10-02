import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/counter'
import path from 'path'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import merge2 from 'deepmerge'
import { TRoomId, TRoomTasklist } from './types'

const CHAT_ROOMS_TASKLIST_MAP_FILE_NAME = process.env.CHAT_ROOMS_TASKLIST_MAP_FILE_NAME || 'chat.rooms-tasklist.json'
const projectRootDir = path.join(__dirname, '../../../../')
const storageRoomsTasklistMapFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_TASKLIST_MAP_FILE_NAME)

const counter = Counter()

class Singleton {
  private static instance: Singleton;
   state: Map<TRoomId, TRoomTasklist>;

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
  public set(key: string, value: TRoomTasklist) {
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
}

export const roomsTasklistMapInstance = Singleton.getInstance()

const overwriteMerge = (_target, source, _options) => source

const syncRoomsTasklistMap = () => {
  const isFirstScriptRun = counter.next().value === 0

  try {
    if (!!storageRoomsTasklistMapFilePath) {
      let oldStatic: { data: { [roomName: string]: TRoomTasklist }, ts: number }
      try {
        oldStatic = getStaticJSONSync(storageRoomsTasklistMapFilePath)
        if (!oldStatic?.data || !oldStatic.ts) throw new Error('ERR#CHAT.SOCKET_131.2: incorrect static data')
      } catch (err) {
        // TODO: Сделать нормальные логи
        console.log('ERR#CHAT.SOCKET_131.1')
        console.log(err)
        oldStatic = { data: {}, ts: 0 }
      }
      const staticData = oldStatic.data
      const ts = new Date().getTime()

      if (isFirstScriptRun) {
        // NOTE: Sync with old state:
        Object.keys(staticData).forEach((roomName: string) => {
          roomsTasklistMapInstance.set(roomName, staticData[roomName])
        })
      }

      const currentRoomsTasklistMapState: { [key: string]: any } = [...roomsTasklistMapInstance.keys()].reduce((acc, userName: string) => { acc[userName] = roomsTasklistMapInstance.get(userName); return acc }, {})
      const newStaticData = merge2(staticData, currentRoomsTasklistMapState, { arrayMerge: overwriteMerge })

      writeStaticJSONAsync(storageRoomsTasklistMapFilePath, { data: newStaticData, ts })
    } else {
      throw new Error(`ERR#CHAT.SOCKET_132: файл не найден: ${storageRoomsTasklistMapFilePath}`)
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
  interval: 5000,
  callbackAsResolve: () => {
    syncRoomsTasklistMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---
