import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/Counter'
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
// import { createDirIfNecessary } from '~/utils/fs-tools/createDirIfNecessary'
// import { moveFileIfExists, moveFileSync } from '~/utils/fs-tools/moveFile'
import { getFiles, getDirectories } from '~/utils/fs-tools'
// import delay from '~/utils/delay'
import { sortByTs } from '~/utils/sortByTs'
import { getUniqueItemsByProperties } from '~/utils/socket/utils/getUniqueItemsByProperties'

const CHAT_ROOMS_STATE_FILE_NAME = process.env.CHAT_ROOMS_STATE_FILE_NAME || 'chat.rooms.json'
const projectRootDir = path.join(__dirname, '../../../../')
const storageDir = path.join(projectRootDir, '/storage')
const uploadsDir = path.join(projectRootDir, '/storage/uploads')
const storageRoomsFilePath = path.join(storageDir, CHAT_ROOMS_STATE_FILE_NAME)

const counter = Counter()

const overwriteMerge = (_target, source, _options) => source
// const concatArrsMerge = (target, source, _options) => [...target, ...source]

const isStatusChanged = (oldData: TMessage, newData: Partial<TMessage>) => oldData.status !== newData.status

class Singleton {
  private static instance: Singleton;
   state: Map<TRoomId, TRoomData>;

  private constructor() {
    this.state = new Map<TRoomId, TRoomData>()
  }

  public getRoomData(room: string) {
    if (!this.state.has(room)) return null

    return this.state.get(room)
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
  public getPartial({ tsPoint, room }: { tsPoint: number, room: string }): { result: TRoomData, errorMsg?: string, nextTsPoint: number | null, isDone: boolean, service?: { msg: string; [key: string]: any } } {
    const roomData = this.state.get(room)
    const result = []
    let nextTsPoint = null
    let counter = 1
    let isDone = false

    if (!roomData) return { result: [], errorMsg: `Condition: !roomData for ${room}`, nextTsPoint: 0, isDone: true }

    const messagesLimit = 100
    const _msgs = []
    const _specialMsgs = []
    const service: any = {}

    const counters = {
      added: 0,
      notAdded: 0,
    }

    // let isCompleted = false

    for (let i = roomData.length - 1; i > -1; i--) { // (let i = roomData.length - 1; !isCompleted && i > -1; i--)
      const isLast = i === 0

      if (counter <= messagesLimit && roomData[i].ts <= tsPoint) {
        // _msgs.push(`[+] i= ${i} [added]`)
        result.unshift(roomData[i])
        counter += 1
        nextTsPoint = isLast ? null : roomData[i - 1].ts
        // console.log(`--- ${i}`, nextTsPoint, `!!nextTsPoint= ${!!nextTsPoint}`, nextTsPoint < tsPoint)
        // console.log(roomData[i])
        isDone = isLast
        // counters.added += 1
      } else if(roomData[i].ts >= tsPoint) {
        // isCompleted = true
      } // else continue

      // _msgs.push(`Iteration done: ${i}, isLast=${isLast}`)
    }
    if (counters.added > 0) _msgs.push(`added: ${counters.added}`)
    if (counters.notAdded > 0) _msgs.push(`notAdded: ${counters.notAdded}`)
    if (_msgs.length > 0) service.msg = [..._msgs, ..._specialMsgs].join('\n')

    return { result, nextTsPoint, isDone, service }
  }
  public async _addFileAsMsg({
    room,
    fileName,
    user,
  }: {
    room: string,
    fileName: string,
    user?: string
  }) {
    let roomData = this.state.get(room)
    let isOk: boolean = false
    const ext = fileName.split('.').reverse()[0]

    if (!ext) return { isOk: false }

    let ts
    try {
      ts = Number(fileName.split('.')[0])
      if (Number.isNaN(ts)) throw new Error('Fuckup: Incorrect name (shoud be number)')
    } catch (err) {
      return { isOk: false }
    }

    const msg = { ts, file: { filePath: `${room}/${fileName}`, fileName }, user: (user || 'pravosleva'), text: '' }

    try {
      if (!roomData) {
        roomsMapInstance.set(room, [msg])
      } else {
        const roomMessages = roomData
        const theMessageIndex = binarySearchTsIndex({
          messages: roomMessages,
          targetTs: ts
        })
        let isExists = theMessageIndex !== -1

        if (!isExists) {
          roomMessages.splice(theMessageIndex, 0, msg)

          this.state.set(room, roomMessages)
        } else {
          // Nothing...
        }
      }
    } catch(err) {
      isOk = false
    }

    return {
      isOk,
    }
  }
  public editMessage(
    { room, name, ts, newData }: {
      room: string,
      name: string,
      ts: number,
      newData: { text: string, status?: EMessageStatus, assignedTo?: string[], links?: { link: string, descr: string }[], position?: number }
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
        let theMessageIndex = binarySearchTsIndex({
          messages: roomMessages,
          targetTs: ts
        })

        // -- TODO: Debug binarySearchTsIndex
        let _findIndexByArrayMethod
        if (theMessageIndex === -1) {
          _findIndexByArrayMethod = roomMessages.findIndex(({ ts: _ts }) => _ts === ts)
          if (_findIndexByArrayMethod !== -1) theMessageIndex = _findIndexByArrayMethod
        }
        // --

        if (theMessageIndex === -1) {
          // shouldLogout = true
          throw new Error(`editMessage ERR1: Попробуйте перезайти | theMessage not found; [room= ${room}, ts= ${ts}, newData.text=${newData.text}]; _findIndexByArrayMethod= ${_findIndexByArrayMethod}`)
        } else {
          const editTs = new Date().getTime()
          if (!roomMessages[theMessageIndex].user) roomMessages[theMessageIndex].user = name
          roomMessages[theMessageIndex].text = newData.text
          roomMessages[theMessageIndex].editTs = editTs
          if (!!newData.status) {
            if (isStatusChanged(roomMessages[theMessageIndex], newData)) {
              roomMessages[theMessageIndex].status = newData.status
              roomMessages[theMessageIndex].statusChangeTs = editTs
            }
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
          if (!!newData.position || newData.position === 0) roomMessages[theMessageIndex].position = newData.position

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

    // console.log(targetMessage)

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
        errMsgData.title = 'SERVER ERR #2021121801:32'
      } else {
        const roomMessages: TMessage[] = roomData

        if (!roomMessages) {
          isOk = false
          isPrivateSocketCb = true
          errMsgData.description = `roomMessages is ${typeof roomMessages} not found`
          errMsgData.title = 'SERVER ERR #2021121802:32'
        } else {
          // const theMessageIndex = userMessages.findIndex(({ ts: t }) => t === ts)
          const theMessageIndex = binarySearchTsIndex({
            messages: roomMessages,
            targetTs: ts
          })

          if (theMessageIndex === -1) {

            isOk = false
            isPrivateSocketCb = true
            errMsgData.description = `theMessage not found for ts ${ts} / room ${room}`
            errMsgData.title = 'SERVER ERR #2021121803:32'
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
      errMsgData.description = !!err.message ? `ERR3: Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error'
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
  public restoreMessage({ room, name, ts, original }: { room: string, name: string, ts: number, original: TMessage }) {
    let roomData = this.state.get(room)
    let isOk: boolean = false
    const errMsgData: { title?: string, description?: string } = {
      title: undefined,
      description: undefined
    }
    let isPrivateSocketCb = false
    let shouldLogout = false
    let targetMessage

    let prevMsgIndex = -1

    try {
      if (!roomData) {
        isOk = false
        isPrivateSocketCb = true
        errMsgData.description = 'roomData not found'
        errMsgData.title = 'SERVER ERR #1001'
      } else {
        const roomMessages: TMessage[] = roomData

        const _theMessageIndex = binarySearchTsIndex({
          messages: roomMessages,
          targetTs: ts
        })
        if (_theMessageIndex !== -1) {
          isOk = false
          isPrivateSocketCb = true
          errMsgData.description = ''
          errMsgData.title = 'Already exists'
          shouldLogout = false
        } else {
          if (!roomMessages) {
            isOk = false
            isPrivateSocketCb = true
            errMsgData.description = `roomMessages is ${typeof roomMessages} not found`
            errMsgData.title = 'SERVER ERR #1002'
          } else {
            // const theMessageIndex = binarySearchTsIndex({
            //   messages: roomMessages,
            //   targetTs: ts
            // })
  
            // if (theMessageIndex === -1) {
  
            //   isOk = false
            //   isPrivateSocketCb = true
            //   errMsgData.description = `theMessage not found for ts ${ts} / room ${room}`
            //   errMsgData.title = 'SERVER ERR #1003'
            // } else {
            //   const _targetMessage = roomMessages[theMessageIndex]
            //   const newUserMessages = roomMessages.filter(({ ts: t }) => t !== ts)
  
            //   roomData = newUserMessages
            //   this.state.set(room, roomData)
            //   isOk = true
            //   isPrivateSocketCb = false
            //   targetMessage = _targetMessage
            // }
            for (let i = 0, max = roomMessages.length; i < max; i++) {
              const { ts } = roomMessages[i]
              if (ts < original.ts) {
                prevMsgIndex = i
              }
            }
  
            if (prevMsgIndex !== -1) {
              // NOTE: https://ru.stackoverflow.com/a/1051779/552549
              roomMessages.splice(prevMsgIndex + 1, 0, { ...original, assignedBy: name })
            } else {
              roomMessages.unshift({ ...original, assignedBy: name })
            }
  
            const _targetMessage = roomMessages[prevMsgIndex + 1]
            this.state.set(room, roomMessages)
            isOk = true
            isPrivateSocketCb = false
            targetMessage = _targetMessage
          }
        }
      }
    } catch (err) {
      isOk = false
      isPrivateSocketCb = true
      errMsgData.description = !!err.message ? `ERR3: Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error'
      errMsgData.title = 'SERVER ERR #1004'
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

type TState = { data: { [roomName: string]: TRoomData }, ts: number }

const syncRoomsMap = () => {
  const isFirstScriptRun = counter.next().value === 0

  try {
    if (!!storageRoomsFilePath) {
      let oldStatic: TState
      try {
        oldStatic = getStaticJSONSync<TState>(storageRoomsFilePath, { data: {}, ts: 1 })
        if (!oldStatic?.data || !oldStatic.ts) {
          console.log(oldStatic)
          throw new Error('ERR#CHAT.SOCKET_111.2: incorrect static data')
        }
      } catch (err) {
        // TODO: Сделать нормальные логи
        console.log(err)
        // oldStatic = { data: {}, ts: 0 }
        process.exit(1)
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

          // 4. Move files from /storage/uploads/<[room]<fileName>> to /storage/uploads/[room]/<fileName>
          const newMsgs = []
          for(const msg of staticData[roomName]) {
            /*
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
            */
            if (!!msg.user) {
              newMsgs.push(msg)
            }
            roomsMapInstance.set(roomName, newMsgs.sort(sortByTs))
          }
          // --

          // 6. Read dirs in /uploads/[roomName]/* and set old msgs if necessary
          const dirs = getDirectories(uploadsDir)
          // console.log(`--- ${uploadsDir}`)
          // console.log(dirs)
          for (const room of dirs) {
            // Object.keys(staticData).forEach((roomName: string) => {})
            const isRoomExists = !!staticData[room]
            if (!isRoomExists) {
              staticData[room] = []
            }
            // console.log(`-- ${room}`)
            const files = getFiles(path.join(projectRootDir, '/storage/uploads', room))
            // NOTE: Set msg if msg.ts does not exists
            
            files.forEach((fileName) => {
              // console.log(fileName)

              try {
                const ts = Number(fileName.split('.')[0])
                const theMessageIndex = binarySearchTsIndex({
                  messages: staticData[room],
                  targetTs: ts
                })
                const isMsgExists = theMessageIndex !== -1
                if (!isMsgExists) {
                  roomsMapInstance._addFileAsMsg({ fileName, room, user: 'pravosleva' })
                  // console.log('file added.')
                }
              } catch (err) {
                console.log(err)
              }
            })
            // console.log(`-- END: ${room}`)
          }
          // console.log('---')
        })

        // 5. Read dirs in /uploads/* and set old msgs if necessary
        /*
        const dirs = getDirectories(uploadsDir)
        console.log('---')
        // console.log(dirs)
        for (const room of dirs) {
          const files = getFiles(path.join(projectRootDir, '/storage/uploads', room))
          console.log('-- 0')
          files.forEach((fileName) => {
            roomsMapInstance._addFileAsMsg({ fileName, room })
          })
          console.log('-- /0')
        }
        console.log('---')
        */
      }

      const currentRoomsState = [...roomsMapInstance.keys()]
        .reduce((acc, roomName) => {
          // const oldArr: TMessage[] = !!staticData[roomName] ? staticData[roomName] : []
          // const newArr: TMessage[] = roomsMapInstance.get(roomName) || []
          // acc[roomName] = [...roomsMapInstance.get(roomName)].sort(sortByTs);
          acc[roomName] = getUniqueItemsByProperties({ items: roomsMapInstance.get(roomName).sort(sortByTs), propNames: ['ts'] });
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
    // console.log('cb called')
  },
  interval: 30 * 60 * 1000, // 30 min
  callbackAsResolve: () => {
    syncRoomsMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---
