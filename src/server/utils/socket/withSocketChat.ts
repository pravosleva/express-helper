import { instrument } from '@socket.io/admin-ui'
import { Socket } from 'socket.io'
import path from 'path'
import { writeStaticJSONAsync, getStaticJSONSync } from '~/utils/fs-tools'
import merge from 'merge-deep'
import merge2 from 'deepmerge'
import { createPollingByConditions } from './createPollingByConditions'
import { Counter } from '~/utils/counter'
import DeviceDetector from "device-detector-js"
import bcrypt from 'bcryptjs'
import { binarySearchTsIndex } from '~/utils/binarySearch'

const { CHAT_ADMIN_TOKEN } = process.env
const isUserAdmin = (token: string) => !!CHAT_ADMIN_TOKEN ? String(token) === CHAT_ADMIN_TOKEN : false

type TUser = {
  socketId: string
  name: string
  room: string
}
type TUserName = string
enum ERegistryLevel {
  Guest = 0,
  Logged = 1,
  TGUser = 2
}
type TConnectionData = Partial<TUser> & { userAgent: DeviceDetector.DeviceDetectorResult }
type TRoomId = string

export type TMessage = {
  text: string
  ts: number
  editTs?: number
  rl?: ERegistryLevel

  registryLevel?: ERegistryLevel
}
export type TRoomTask = {
  title: string
  description?: string
  isCompleted: boolean
  ts: number
  editTs?: number
}
type TRoomTasklist = TRoomTask[]
type TRoomData = {
  [userName: string]: TMessage[]
}
type TSocketId = string
const usersSocketMap = new Map<TSocketId, TUserName>()
const usersMap = new Map<TUserName, TConnectionData>()
const registeredUsersMap = new Map<TUserName, { passwordHash: string, registryLevel?: ERegistryLevel }>()
const roomsMap = new Map<TRoomId, TRoomData>()
const roomsTasklistMap = new Map<TRoomId, TRoomTasklist>()

// NOTE: For example
// const salt = bcrypt.genSaltSync(3);
// const hash = bcrypt.hashSync("1", salt)
// console.log(hash)
// registeredUsersMap.set('Den', { passwordHash: '$2a$04$XlLY/M5OtNAmGKuLJ14j6e3PcpwfkccMBIpJlXufTHmVdgUXW6NY6', registryLevel: ERegistryLevel.Logged }) // 1

// -- TODO: Refactor?
const projectRootDir = path.join(__dirname, '../../../')
// const CHAT_USERS_STATE_FILE_NAME = process.env.CHAT_USERS_STATE_FILE_NAME || 'chat.users.json'
const CHAT_ROOMS_STATE_FILE_NAME = process.env.CHAT_ROOMS_STATE_FILE_NAME || 'chat.rooms.json'
const CHAT_PASSWORD_HASHES_MAP_FILE_NAME = process.env.CHAT_PASSWORD_HASHES_MAP_FILE_NAME || 'chat.passwd-hashes.json'
const CHAT_ROOMS_TASKLIST_MAP_FILE_NAME = process.env.CHAT_ROOMS_TASKLIST_MAP_FILE_NAME || 'chat.rooms-tasklist.json'

// const storageUsersFilePath = path.join(projectRootDir, '/storage', CHAT_USERS_STATE_FILE_NAME)
const storageRoomsFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_STATE_FILE_NAME)
const storageRegistryMapFilePath = path.join(projectRootDir, '/storage', CHAT_PASSWORD_HASHES_MAP_FILE_NAME)
const storageRoomsTasklistMapFilePath = path.join(projectRootDir, '/storage', CHAT_ROOMS_TASKLIST_MAP_FILE_NAME)
// const counter1 = Counter()
const counter2 = Counter()
const counter3 = Counter()
const counter4 = Counter()

const syncRegistryMap = () => {
  const isFirstScriptRun = counter3.next().value === 0

  try {
    if (!!storageRegistryMapFilePath) {
      let oldStatic: { data: { [key: string]: { passwordHash: string, registryLevel?: ERegistryLevel } }, ts: number }
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
          registeredUsersMap.set(name, staticData[name])
        })
      }

      const currentRegistryMapState: { [key: string]: TConnectionData } = [...registeredUsersMap.keys()].reduce((acc, userName: string) => { acc[userName] = registeredUsersMap.get(userName); return acc }, {})
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

const overwriteMerge = (_target, source, _options) => source

const syncRoomsTasklistMap = () => {
  const isFirstScriptRun = counter4.next().value === 0

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
          roomsTasklistMap.set(roomName, staticData[roomName])
        })
      }

      const currentRoomsTasklistMapState: { [key: string]: any } = [...roomsTasklistMap.keys()].reduce((acc, userName: string) => { acc[userName] = roomsTasklistMap.get(userName); return acc }, {})
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

// const syncUsersMap = () => {
//   const isFirstScriptRun = counter1.next().value === 0

//   try {
//     if (!!storageUsersFilePath) {
//       let oldStatic: { data: { [key: string]: TConnectionData }, ts: number }
//       try {
//         oldStatic = getStaticJSONSync(storageUsersFilePath)
//         if (!oldStatic?.data || !oldStatic.ts) throw new Error('ERR#CHAT.SOCKET_101.2: incorrect static data')
//       } catch (err) {
//         // TODO: Сделать нормальные логи
//         console.log('ERR#CHAT.SOCKET_101.1')
//         console.log(err)
//         oldStatic = { data: {}, ts: 0 }
//       }
//       const staticData = oldStatic.data
//       const ts = new Date().getTime()

//       if (isFirstScriptRun) {
//         // NOTE: Sync with old state:
//         Object.keys(staticData).forEach((name: string) => {
//           usersMap.set(name, staticData[name])
//         })
//       }

//       const currentUsersState: { [key: string]: TConnectionData } = [...usersMap.keys()].reduce((acc, str: string) => { acc[str] = usersMap.get(str); return acc }, {})
//       const newStaticData = merge(staticData, currentUsersState)

//       writeStaticJSONAsync(storageUsersFilePath, { data: newStaticData, ts })
//     } else {
//       throw new Error(`ERR#CHAT.SOCKET_102: файл не найден: ${storageUsersFilePath}`)
//     }
//   } catch (err) {
//     // TODO: Сделать нормальные логи
//     console.log(err)
//   }
// }

const syncRoomsMap = () => {
  const isFirstScriptRun = counter2.next().value === 0

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
          roomsMap.set(roomName, staticData[roomName])
        })
      }

      const currentRoomsState = [...roomsMap.keys()]
        .reduce((acc, roomName) => {
          acc[roomName] = roomsMap.get(roomName);
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
    // syncUsersMap()
    syncRoomsMap()
    syncRegistryMap()
    syncRoomsTasklistMap()
  },
  toBeOrNotToBe: () => true, // Need to retry again
  callbackAsReject: () => {
    console.log('NOWHERE')
  },
})
// ---

const deviceDetector = new DeviceDetector()
const getParsedUserAgent = (socket: any): DeviceDetector.DeviceDetectorResult => deviceDetector.parse(socket.handshake.headers['user-agent'])

export const withSocketChat = (io: Socket) => {
  io.on('connection', (socket) => {
    const nameBySocketId = usersSocketMap.get(socket.id)
    if (!!nameBySocketId) {
      usersSocketMap.delete(socket.id)
      usersMap.delete(nameBySocketId)
    }

    socket.on('setMeAgain', ({ name, room }, cb) => {
      // ---
      const myRegData = registeredUsersMap.get(name)
      socket.emit('my.user-data', myRegData || null)
      // ---
      if (!name || !room) {
        cb('Попробуйте перезайти')
        return
      }
      console.log('-- setMeAgain')

      socket.join(room) // NOTE: Только для этого
      usersSocketMap.set(socket.id, name)

      const existingUser = usersMap.get(name)
      const userAgent = getParsedUserAgent(socket) || null

      if (!!existingUser) {
        usersMap.set(name, { ...existingUser, name, room, socketId: socket.id, userAgent })
      } else {
        usersMap.set(name, { name, room, socketId: socket.id, userAgent })
      }

      const roomData = roomsMap.get(room)
      if (!roomData) {
        roomsMap.set(room, { [name]: [] })
      } else {
        const newUserRoomData = roomData[name]
        if (!newUserRoomData) roomData[name] = []
        
        roomsMap.set(room, roomData)
      }

      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
    })
    socket.on('unsetMe', ({ name, room }) => {
      const nameBySocketId = usersSocketMap.get(socket.id)
      if (!!nameBySocketId) {
        usersSocketMap.delete(socket.id)
        usersMap.delete(nameBySocketId)
      }

      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
    })

    socket.on('login.set-pas-level-1', ({ password, name }, cb: (errMsg?: string) => void) => {
      if (!name || !password) {
        if (!!cb) cb('Username & Password are required')
        return
      }

      if (!!registeredUsersMap.has(name)) {
        const regData = registeredUsersMap.get(name)
        switch (true) {
          case regData.registryLevel === ERegistryLevel.Guest || regData.registryLevel === ERegistryLevel.Logged:
            const hash = bcrypt.hashSync(password)

            regData.passwordHash = hash
            regData.registryLevel = ERegistryLevel.Logged
            registeredUsersMap.set(name, regData)
            if (!!cb) cb()
            break
          default:
            if (!!cb) cb('Вы можете сбросить пароль только через TG бот')
        }
        socket.emit('my.user-data', regData)
      } else {
        const hash = bcrypt.hashSync(password)

        const regData: any = { passwordHash: hash, registryLevel: ERegistryLevel.Logged }
        registeredUsersMap.set(name, regData)
        if (!!cb) cb()
        socket.emit('my.user-data', regData)
      }
    })

    socket.on('login.password', ({ password, name, room, token }, cb?: (reason?: string, isAdmin?: boolean) => void) => {
      if (!name || !room) {
        if (!!cb) cb('Room and Username are required')
        return
      }

      if (!registeredUsersMap.has(name)) {
        if (!!cb) cb('User not fount')
        return
      }

      const { passwordHash, registryLevel, ...rest } = registeredUsersMap.get(name)
      if (!bcrypt.compareSync(password, passwordHash)) {
        if (!!cb) cb('Incorrect password')
        return
      }

      socket.join(room)
      const roomData = roomsMap.get(room)
      if (!roomData) {
        roomsMap.set(room, { [name]: [] })
      } else {
        let newUserRoomData = roomData[name]
        if (!newUserRoomData) roomData[name] = []
        
        roomsMap.set(room, roomData)
      }
      socket.emit('oldChat', { roomData: roomsMap.get(room) })
      
      io.in(room).emit('notification', { status: 'info', description: `${name} just entered the room` })
      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))

      // io.emit('notification', { status: 'info', description: 'Someone\'s here' })

      if (!!cb) cb(null, isUserAdmin(token))
    })

    socket.on('login', ({ name, room, token }, cb?: (reason?: string, isAdmin?: boolean) => void) => {
      if (!name || !room) {
        if (!!cb) cb('Room and Username are required')
        return
      }

      // --- NEW WAY
      if (usersMap.has(name)) {
        if (!!cb) cb(`Username ${name} already taken`)
        return
      }

      if (registeredUsersMap.has(name)) {
        // NOTE: Need to login with password
        if (!!cb) cb('FRONT:LOG/PAS')
        return
      }

      socket.join(room)

      const roomData = roomsMap.get(room)
      if (!roomData) {
        roomsMap.set(room, { [name]: [] })
      } else {
        let newUserRoomData = roomData[name]
        if (!newUserRoomData) roomData[name] = []
        
        roomsMap.set(room, roomData)
      }
      socket.emit('oldChat', { roomData: roomsMap.get(room) })
      
      io.in(room).emit('notification', { status: 'info', description: `${name} just entered the room` })
      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))

      // io.emit('notification', { status: 'info', description: 'Someone\'s here' })

      if (!!cb) cb(null, isUserAdmin(token))

      // ---
    })
    socket.on('logout', ({ name }) => {
      const userConnData = usersMap.get(name)
      // io.emit('notification', { status: 'info', description: 'Someone disconnected' })
      usersSocketMap.delete(socket.id)

      if (!!userConnData) {
        usersMap.delete(name)
        if (!!userConnData?.room) {
          socket.leave(userConnData.room)
          io.in(userConnData.room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room: usersMap.get(str).room })).filter(({ room }) => room === userConnData.room))
          io.in(userConnData.room).emit('notification', { status: 'info', description: `${name} just left the room`, _originalEvent: { name } })
        }
      }
    })

    socket.on('getUsers', ({ room }) => {
      socket.emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room: usersMap.get(str).room })).filter(({ room: r }) => room === r))
    })

    socket.on('getAllInfo', () => {
      socket.emit('allUsers', [...usersMap.keys()].map((str: string) => ({ name: str, room: usersMap.get(str).room, userAgent: usersMap.get(str).userAgent })))
      socket.emit('allRooms', { roomsData: [...roomsMap.keys()].reduce((acc, roomName) => { acc[roomName] = roomsMap.get(roomName); return acc }, {}) })
    })

    socket.on('sendMessage', ({ message, userName }, cb) => {
      // --- NEW WAY
      const ts = Date.now()
      try {
        const { room, name } = usersMap.get(userName)
        const newRoomData = roomsMap.get(room)

        let registryLevel = 0
        const regData = registeredUsersMap.get(userName)
        if (registeredUsersMap.has(userName)) {
          registryLevel = 1
          if (!!regData.registryLevel) registryLevel = regData.registryLevel
        }
        
        newRoomData[name].push({ text: message, ts, rl: registryLevel })

        roomsMap.set(room, newRoomData)

        io.in(room).emit('message', { user: name, text: message, ts, rl: registryLevel });
        if (!!cb) cb()
      } catch (err) {
        socket.emit('notification', { status: 'error', title: 'ERR #1', description: err.message || 'Server error', _originalEvent: { message, userName } })
      }
      // ---
    })

    socket.on('editMessage', ({ room, name, ts, newMessage }, cb) => {
      const roomData = roomsMap.get(room)

      if (!roomData) {
        if (cb) cb('roomData not found')
        return
      } else {
        const userMessages = roomData[name]

        if (!userMessages) {
          if (cb) cb('roomData[name] not found')
          return
        } else {
          // const theMessageIndex = userMessages.findIndex(({ ts: t }) => t === ts)
          const theMessageIndex = binarySearchTsIndex({
            messages: userMessages,
            targetTs: ts
          })

          if (theMessageIndex === -1) {
            if (cb) cb('theMessage not found')
            return
          } else {
            userMessages[theMessageIndex].text = newMessage
            userMessages[theMessageIndex].editTs = new Date().getTime()
            roomData[name] = userMessages
            roomsMap.set(room, roomData)
            io.in(room).emit('oldChat', { roomData: roomsMap.get(room) });
          }
        }
      }
    })
    socket.on('deleteMessage', ({ room, name, ts }, cb) => {
      const roomData = roomsMap.get(room)

      if (!roomData) {
        if (cb) cb('roomData not found')
        return
      } else {
        const userMessages = roomData[name]

        if (!userMessages) {
          if (cb) cb('roomData[name] not found')
          return
        } else {
          // const theMessageIndex = userMessages.findIndex(({ ts: t }) => t === ts)
          const theMessageIndex = binarySearchTsIndex({
            messages: userMessages,
            targetTs: ts
          })

          if (theMessageIndex === -1) {
            if (cb) cb('theMessage not found')
            return
          } else {
            // userMessages[theMessageIndex].text = newMessage
            const newUserMessages = userMessages.filter(({ ts: t }) => t !== ts)
            roomData[name] = newUserMessages
            roomsMap.set(room, roomData)
            io.in(room).emit('oldChat', { roomData: roomsMap.get(room) });
          }
        }
      }
    })

    // --- NOTE: TASKLIST
    socket.on("createTask", ({ room, title, description }: Partial<TRoomTask> & { room: string }, cb?: (errMsg?: string) => void) => {
      if (!room || !title) {
        if (!!cb) cb('ERR: title & room are required')
        return
      }

      let roomTasklist = roomsTasklistMap.get(room)
      const ts = Date.now()
      const newTask = { ts, title, description, isCompleted: false }

      if (!!roomTasklist && Array.isArray(roomTasklist)) {
        roomTasklist.push(newTask)
      } else {
        roomTasklist = [newTask]
      }
      roomsTasklistMap.set(room, roomTasklist)
      io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) });
      if (!!cb) cb()
    })
    socket.on("updateTask", ({ room, ts, title, description, isCompleted }: Partial<TRoomTask> & { room: string }, cb?: (errMsg?: string) => void) => {
      if (!ts) {
        if (!!cb) cb('ERR: ts param is required')
        return
      }

      let roomTasklist: TRoomTask[] | undefined = roomsTasklistMap.get(room)
      let newTask: TRoomTask

      if (!!roomTasklist && Array.isArray(roomTasklist)) {
        const theTaskIndex = binarySearchTsIndex({
          messages: roomTasklist,
          targetTs: ts
        })
        const editTs = Date.now()

        if (theTaskIndex !== -1) {
          newTask = roomTasklist[theTaskIndex]
          if (!!title) newTask.title = title
          if (!!description) newTask.description = description
          if (isCompleted === true || isCompleted === false) newTask.isCompleted = isCompleted
          newTask.editTs = editTs

          roomTasklist[theTaskIndex] = newTask
          roomsTasklistMap.set(room, roomTasklist)

          io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) });
        } else {
          if (!!title || !!description) cb('ERR: theTaskIndex NOT FOUND: title & description param are required')
          return
        }
      } else {
        if (!!title || !!description) {
          cb('ERR: roomTasklist NOT FOUND: title & description param are required')
          return
        } else {
          const ts = Date.now()
          newTask = { title, description, ts, isCompleted: isCompleted || false }
          roomsTasklistMap.set(room, [newTask])
          io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) });
          if (!!cb) cb()
        }
      }
    })
    socket.on("deleteTask", ({ room, ts }: Partial<TRoomTask> & { room: string }, cb?: (errMsg?: string) => void) => {
      if (!ts) {
        if (!!cb) cb('ERR: ts param is required')
        return
      } else {
        let roomTasklist: TRoomTask[] | undefined = roomsTasklistMap.get(room)

        if (!!roomTasklist && Array.isArray(roomTasklist)) {
          const theTaskIndex = binarySearchTsIndex({
            messages: roomTasklist,
            targetTs: ts
          })
          if (theTaskIndex !== -1) {
            const newTasklist = roomTasklist.filter(({ ts: t }) => t !== ts)
            roomsTasklistMap.set(room, newTasklist)
            io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) });
          } else {
            if (cb) cb('ERR: theTask not found')
            return
          }
        } else {
          if (cb) cb('ERR: roomTasklist not found')
          return
        }
      }
    })
    socket.on('getTasklist', ({ room }: { room: string }) => {
      socket.emit('tasklist', { tasklist: roomsTasklistMap.get(room) || [] })
    })
    // ---

    socket.on("disconnect", () => {
        // console.log(usersMap)
        
        // TODO: Find name by socket.id -> usersMap.delete(user.name)

        // try {
        //   const user = deleteUser(socket.id)
        //   usersMap.delete(user.name)
        //   if (user) {
        //     io.in(user.room).emit('notification', { status: 'info', title: 'Someone disconnected', description: `${user.name} just disconnected` })
        //     io.in(user.room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str })))
        //   }
        // } catch (err) {
        //   console.log(err)
        // }
        
        const userName = usersSocketMap.get(socket.id)
        if (!!userName) {
          usersSocketMap.delete(socket.id)

          const userConnData = usersMap.get(userName)
          // io.emit('notification', { status: 'info', description: 'Someone disconnected' })

          if (!!userConnData) {
            usersMap.delete(userName)
            if (!!userConnData?.room) {
              io.in(userConnData.room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room: userConnData.room })).filter(({ room }) => room === userConnData.room))
            }
          }
        }
    })
  })

  // @ts-ignore
  instrument(io, {
    auth: false,
    namespace: '/admin',
  })
}