import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/counter'
import path from 'path'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import merge2 from 'deepmerge'
import {
  TRoomId,
  TRoomData,
  TMessage,
} from './types'

const CHAT_ROOMS_STATE_FILE_NAME = process.env.CHAT_ROOMS_STATE_FILE_NAME || 'chat.rooms.json'
const projectRootDir = path.join(__dirname, '../../../../')
const storageRoomsFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_STATE_FILE_NAME)

const counter = Counter()

const overwriteMerge = (_target, source, _options) => source

// const getDaysRange = ({ roomState, toDate, fromDate }: { roomState: TRoomData, toDate: Date, fromDate: Date }): TRoomData => {
//   const keys = Object.keys(roomState)
//   const result: TRoomData = {}
//   const toTs: number = new Date(toDate).getTime()
//   const fromTs: number = new Date(fromDate).getTime()

//   keys.forEach((name: string) => {
//     if (!result[name]) result[name] = []
//     roomState[name].forEach((msgData: TMessage) => {
//       const { ts } = msgData

//       if (ts > fromTs && ts <= toTs) result[name].push(msgData)
//     })
//   })

//   return result
// }

class Singleton {
  private static instance: Singleton;
   state: Map<TRoomId, TRoomData>;

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
  public set(key: string, value: TRoomData) {
    this.state.set(key, value)
  }
  public get(key: string): TRoomData {
    return this.state.get(key)
  }
  // public getSomeDay(key: string, lastDayTs: number): { roomData: TRoomData, newToDayTs: number } {
  //   const roomState: TRoomData = this.state.get(key)
  //   const toDate = new Date(lastDayTs)
  //   const fromDate = new Date(toDate.getDate() - 1)
  //   const result = getDaysRange({ roomState, toDate, fromDate })

  //   return { roomData: result, newToDayTs: fromDate.getTime() }
  // }
  public delete(key: string) {
    return this.state.delete(key)
  }
  public has(key: string) {
    return this.state.has(key)
  }
  public get size(): number {
    return this.state.size
  }
}

export const roomsMapInstance = Singleton.getInstance()
const tsSortDEC = (e1: TMessage, e2: TMessage) => e1.ts - e2.ts

const syncRoomsMap = () => {
  const isFirstScriptRun = counter.next().value === 0

  try {
    if (!!storageRoomsFilePath) {
      let oldStatic: { data: { [roomName: string]: TRoomData }, ts: number }
      try {
        oldStatic = getStaticJSONSync(storageRoomsFilePath)
        if (!oldStatic?.data || !oldStatic.ts) throw new Error('ERR#CHAT.SOCKET_111.2: incorrect static data')
      } catch (err) {
        // TODO: Сделать нормальные логи
        console.log('ERR#CHAT.SOCKET_111.1')
        console.log(err)
        oldStatic = { data: {}, ts: 0 }
      }
      const staticData = oldStatic.data
      const ts = new Date().getTime()

      if (isFirstScriptRun) {
        // NOTE: Sync with old state:
        Object.keys(staticData).forEach((roomName: string) => {
          // -- OLD format transform
          /*
            {"data":{"ux-test":{"Den":[{"text":"tst2","ts":1633145946256,"rl":1},{"text":"tst","ts":1633146080967,"rl":1}]}},"ts":1633146858011}
          */
          if (!Array.isArray(staticData[roomName])) {
            let newFormat = []
            Object.keys(staticData[roomName]).forEach((name: string) => {
              newFormat = [...newFormat, ...staticData[roomName][name].map(origin => ({ ...origin, user: name }))]
            })
            roomsMapInstance.set(roomName, newFormat.sort(tsSortDEC))
          } else {
            roomsMapInstance.set(roomName, staticData[roomName])
          }
          // --
        })
      }

      const currentRoomsState = [...roomsMapInstance.keys()]
        .reduce((acc, roomName) => {
          acc[roomName] = roomsMapInstance.get(roomName);
          // -- tmp
          // Object.keys(acc[roomName]).forEach((key) => {
          //   acc[roomName][key].forEach(({ text, ts, registryLevel }: TMessage, i: number) => {
          //     acc[roomName][key][i] = { text, ts }
          //     if (!!registryLevel) acc[roomName][key][i].rl = registryLevel
          //   })
          // })
          // --
          return acc
        }, {})
      const newStaticData = merge2(staticData, currentRoomsState, { arrayMerge: overwriteMerge })

      writeStaticJSONAsync(storageRoomsFilePath, { data: newStaticData, ts })
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
    syncRoomsMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---
