import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/counter'
import path from 'path'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import merge2 from 'deepmerge'
import {
  TRoomId,
  TRoomData,
  TMessage,
  EMessageStatus,
} from './types'
import { binarySearchTsIndex } from '~/utils/binarySearch'
import { createDirIfNecessary } from '~/utils/fs-tools/createDirIfNecessary'
import { moveFileIfExists, moveFileSync } from '~/utils/fs-tools/moveFile'

const CHAT_ROOMS_STATE_FILE_NAME = process.env.CHAT_ROOMS_STATE_FILE_NAME || 'chat.rooms.json'
const projectRootDir = path.join(__dirname, '../../../../')
const storageRoomsFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_STATE_FILE_NAME)

const counter = Counter()

const overwriteMerge = (_target, source, _options) => source

class Singleton {
  private static instance: Singleton;
   state: Map<TRoomId, TRoomData>;

  private constructor() {
    this.state = new Map<TRoomId, TRoomData>()
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
  public delete(key: string) {
    return this.state.delete(key)
  }
  public has(key: string) {
    return this.state.has(key)
  }
  public get size(): number {
    return this.state.size
  }
  public getPartial({ tsPoint, room }: { tsPoint: number, room: string }): { result: TRoomData, errorMsg?: string, nextTsPoint: number | null, isDone: boolean } {
    const roomData = this.state.get(room)
    const result = []
    let nextTsPoint = null
    let counter = 1
    let isDone = false

    if (!roomData) return { result: [], errorMsg: `Condition: !roomData for ${room}`, nextTsPoint: 0, isDone: true }

    const limit = 10

    for (let i = roomData.length - 1; i > -1; i--) {
      const isLast = i === 0

      if (counter <= limit && roomData[i].ts <= tsPoint) {

        result.unshift(roomData[i])
        counter += 1
        nextTsPoint = isLast ? null : roomData[i - 1].ts
        // console.log(`--- ${i}`, nextTsPoint, `!!nextTsPoint= ${!!nextTsPoint}`, nextTsPoint < tsPoint)
        // console.log(roomData[i])
        isDone = isLast
      }
    }

    return { result, nextTsPoint, isDone }
  }
  public editMessage(
    { room, name, ts, newData }: {
      room: string,
      name: string,
      ts: number,
      newData: { text: string, status?: EMessageStatus, assignedTo?: string[], links?: { link: string, descr: string }[] }
    }
  ): {
    isOk: boolean,
    errMsgData?: { title?: string, description?: string | null },
    isPrivateSocketCb: boolean,
    shouldLogout: boolean,
    targetMessage: TMessage
  } {
    let roomData = this.state.get(room)
    let isOk: boolean = false
    const errMsgData: { title?: string, description?: string } = {
      title: undefined,
      description: undefined
    }
    let isPrivateSocketCb = false
    let shouldLogout = false
    let targetMessage

    try {
      if (!roomData) {
        throw new Error('roomData not found')
      } else {
        const roomMessages = roomData
        // const theMessageIndex = roomMessages.findIndex(({ ts: t }) => t === ts)
        const theMessageIndex = binarySearchTsIndex({
          messages: roomMessages,
          targetTs: ts
        })

        if (theMessageIndex === -1) {
          shouldLogout = true
          throw new Error('theMessage not found; Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств;')
        } else {
          roomMessages[theMessageIndex].text = newData.text
          roomMessages[theMessageIndex].editTs = new Date().getTime()
          if (!!newData.status) {
            roomMessages[theMessageIndex].status = newData.status
          } else {
            if (!!roomMessages[theMessageIndex].status) delete roomMessages[theMessageIndex].status
          }

          if (!!newData.assignedTo && Array.isArray(newData.assignedTo) && newData.assignedTo.length > 0) {
            roomMessages[theMessageIndex].assignedTo = newData.assignedTo
            roomMessages[theMessageIndex].assignedBy = name
          } else {
            if (!!roomMessages[theMessageIndex].assignedTo) delete roomMessages[theMessageIndex].assignedTo
          }

          if (!!newData.links && Array.isArray(newData.links) && newData.links.length > 0) {
            roomMessages[theMessageIndex].links = newData.links
          } else {
            delete roomMessages[theMessageIndex].links
          }

          // console.log(roomMessages[theMessageIndex])

          roomData = roomMessages
          this.state.set(room, roomData)

          isOk = true
          targetMessage = roomMessages[theMessageIndex]

          // io.in(room).emit('message.update', roomMessages[theMessageIndex]);
        }
      }
    } catch(err) {
      isOk = false
      isPrivateSocketCb = true
      errMsgData.description = err.message
      errMsgData.title = 'SERVER ERR #1: EDIT MESSAGE'

      // socket.emit('notification', { status: 'error', title: 'ERR #1', description: !!err.message ? `Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error' })
      // socket.emit('FRONT:LOGOUT')
    }

    return {
      isOk,
      errMsgData,
      isPrivateSocketCb,
      shouldLogout,
      targetMessage,
    }
  }

  public deleteLink({ ts, room, name, link }: { ts: number, room: string, name: string, link: string }) {
    let roomData = this.state.get(room)
    let isOk: boolean = false
    const errMsgData: { title?: string, description?: string } = {
      title: undefined,
      description: undefined
    }
    let isPrivateSocketCb = false
    let shouldLogout = false
    let targetMessage

    try {
      if (!roomData) {
        throw new Error('roomData not found')
      } else {
        const roomMessages = roomData
        // const theMessageIndex = roomMessages.findIndex(({ ts: t }) => t === ts)
        const theMessageIndex = binarySearchTsIndex({
          messages: roomMessages,
          targetTs: ts
        })

        if (theMessageIndex === -1) {
          shouldLogout = true
          throw new Error('theMessage not found; Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств;')
        } else {
          if (!!roomMessages[theMessageIndex].links && Array.isArray(roomMessages[theMessageIndex].links) && roomMessages[theMessageIndex].links.length > 0) {
            roomMessages[theMessageIndex].links = roomMessages[theMessageIndex].links.filter(({ link: _link }) => _link !== link)
          } else {
            delete roomMessages[theMessageIndex].links
          }

          roomData = roomMessages
          this.state.set(room, roomData)

          isOk = true
          targetMessage = roomMessages[theMessageIndex]

          // io.in(room).emit('message.update', roomMessages[theMessageIndex]);
        }
      }
    } catch(err) {
      isOk = false
      isPrivateSocketCb = true
      errMsgData.description = err.message
      errMsgData.title = 'SERVER ERR #1.1: EDIT MESSAGE (DEL LINK)'

      // socket.emit('notification', { status: 'error', title: 'ERR #1', description: !!err.message ? `Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error' })
      // socket.emit('FRONT:LOGOUT')
    }

    return {
      isOk,
      errMsgData,
      isPrivateSocketCb,
      shouldLogout,
      targetMessage,
    }
  }

  public deleteMessage({ roomId: room, ts }: { roomId: string, ts: number }) {
    let roomData = this.state.get(room)
    let isOk: boolean = false
    const errMsgData: { title?: string, description?: string } = {
      title: undefined,
      description: undefined
    }
    let isPrivateSocketCb = false
    let shouldLogout = false
    let targetMessage

    try {
      if (!roomData) {
        isOk = false
        isPrivateSocketCb = true
        errMsgData.description = 'roomData not found'
        errMsgData.title = 'SERVER ERR #2021121800:32'
      } else {
        const roomMessages: TMessage[] = roomData

        if (!roomMessages) {
          isOk = false
          isPrivateSocketCb = true
          errMsgData.description = `roomMessages is ${typeof roomMessages} not found`
          errMsgData.title = 'SERVER ERR #2021121800:32'
        } else {
          // const theMessageIndex = userMessages.findIndex(({ ts: t }) => t === ts)
          const theMessageIndex = binarySearchTsIndex({
            messages: roomMessages,
            targetTs: ts
          })

          if (theMessageIndex === -1) {

            isOk = false
            isPrivateSocketCb = true
            errMsgData.description = `theMessage not found for ts ${ts}`
            errMsgData.title = 'SERVER ERR #2021121800:32'
          } else {
            const _targetMessage = roomMessages[theMessageIndex]
            const newUserMessages = roomMessages.filter(({ ts: t }) => t !== ts)

            roomData = newUserMessages
            this.state.set(room, roomData)
            isOk = true
            isPrivateSocketCb = false
            targetMessage = _targetMessage
          }
        }
      }
    } catch (err) {
      isOk = false
      isPrivateSocketCb = true
      errMsgData.description = !!err.message ? `ERR: Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error'
      errMsgData.title = 'SERVER #ERR3'
      shouldLogout = true
    }

    return {
      isOk,
      errMsgData,
      isPrivateSocketCb,
      shouldLogout,
      targetMessage,
    }
  }
  // public setMsgType({}: ) {}
  public getTsMap(rooms: string[]) {
    const res: {[key: string]: number} = {}

    rooms.forEach((name: string) => {
      const roomData = this.state.get(name)

      if (!!roomData && Array.isArray(roomData)) {
        const lastIndex = roomData.length > 0 ? roomData.length - 1 : -1

        if (lastIndex !== -1) res[name] = !!roomData[lastIndex].editTs ? roomData[lastIndex].editTs : roomData[lastIndex].ts
      }
    })

    return res
  }
}

export const roomsMapInstance = Singleton.getInstance()
// const tsSortDEC = (e1: TMessage, e2: TMessage) => e1.ts - e2.ts

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
          // 1.
          /*
            {"data":{"ux-test":{"Den":[{"text":"tst2","ts":1633145946256,"rl":1},{"text":"tst","ts":1633146080967,"rl":1}]}},"ts":1633146858011}
          */
          // if (!Array.isArray(staticData[roomName])) {
          //   let newFormat = []
          //   Object.keys(staticData[roomName]).forEach((name: string) => {
          //     newFormat = [...newFormat, ...staticData[roomName][name].map(origin => ({ ...origin, user: name }))]
          //   })
          //   roomsMapInstance.set(roomName, newFormat.sort(tsSortDEC))
          // } else {
          //   roomsMapInstance.set(roomName, staticData[roomName].sort(tsSortDEC))
          // }

          // 2: Rename msg prop type -> status
          // const newMsgs = []
          // for(const msg of staticData[roomName]) {
          //   // @ts-ignore
          //   if (!!msg.type) {
          //     // @ts-ignore
          //     msg.status = msg.type
          //     // @ts-ignore
          //     delete msg.type
          //   }
          //   newMsgs.push(msg)
          //   roomsMapInstance.set(roomName, newMsgs)
          // }

          // 3. Rename Den author to pravosleva
          // const newMsgs = []
          // for(const msg of staticData[roomName]) {
          //   if (msg.user === 'Den') msg.user = 'pravosleva'

          //   newMsgs.push(msg)
          //   roomsMapInstance.set(roomName, newMsgs)
          // }

          // 4. move files from /storage/uploads/<[room]<fileName>> to /storage/uploads/[room]/<fileName>
          
          const newMsgs = []
          for(const msg of staticData[roomName]) {
            /*
            if (!!msg.fileName) {
              // console.log(`- ${msg.fileName}`)
              const hasBracketInName = new RegExp('\\[').test(msg.fileName)

              if (hasBracketInName) {
                // console.log('- hasBracketInName')
                // msg.user = 'pravosleva'
                // 1.1. move file
                const oldPath = path.join(projectRootDir, '/storage/uploads', msg.fileName)
                const fileName = msg.fileName.split('/').reverse()[0]
                const newFileName = fileName.split(']').reverse()[0]
                const _re = new RegExp(/\[(.*)\]/)
                const _roomName = fileName.match(_re)[1]

                // console.log('_roomName', _roomName)

                // 1.2. mkdir ifNecessary
                const roomUploasDir = path.join(projectRootDir, '/storage/uploads', _roomName)
                createDirIfNecessary(roomUploasDir)

                // move file
                const newPath = path.join(roomUploasDir, newFileName)
                // console.log(`->> ${oldPath} -> ${newPath}`)
                try {
                  moveFileSync(oldPath, newPath, (err) => {
                    if (!!err) {
                      console.log('ERR: Не удалось перенести файл', msg.fileName)
                      console.log(err)
                    } else {
                      // 1.3. update value
                      msg.fileName = newFileName
                      msg.filePath = `${_roomName}/${newFileName}`
                      // delete msg.filePath
                    }
                  })


                } catch (err) {
                  console.log(err)
                }

              } else {
                // console.log('- !hasBracketInName')
                // if (msg.filePath !== 'room-101/1640124612218.png')
                // 2. move file
                const oldPath = path.join(projectRootDir, '/storage/uploads', msg.fileName)

                const roomUploasDir = path.join(projectRootDir, '/storage/uploads', roomName)
                createDirIfNecessary(roomUploasDir)

                const newPath = path.join(projectRootDir, '/storage/uploads', `/${roomName}`, msg.fileName)

                // console.log(`-> ${oldPath} -> ${newPath}`)

                moveFileSync(oldPath, newPath, (err) => {
                  if (!!err) {
                    console.log('ERR: Не удалось перенести файл', msg.fileName)
                    console.log(err.message)
                  } else {
                    // 1.3. update value
                    // msg.fileName = newFileName
                    msg.filePath = `${roomName}/${msg.fileName}`
                    // delete msg.filePath
                  }
                })
              }
            } else {
              // console.log('!msg.fileName')
            }
            */

            // Others...
            /**/
            // @ts-ignore
            if (!!msg.filePath) {
              msg.file = {
                // @ts-ignore
                filePath: msg.filePath,
                // @ts-ignore
                fileName: msg.fileName,
              }
              // @ts-ignore
              delete msg.filePath
              // @ts-ignore
              delete msg.fileName
            }
            /**/

            newMsgs.push(msg)
            roomsMapInstance.set(roomName, newMsgs)
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
  interval: 30000,
  callbackAsResolve: () => {
    syncRoomsMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---
