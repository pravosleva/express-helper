import { instrument } from '@socket.io/admin-ui'
import { Socket } from 'socket.io'
import bcrypt from 'bcryptjs'
import { binarySearchTsIndex } from '~/utils/binarySearch'
import { getRandomString } from '~/utils/getRandomString'
import {
  roomsMapInstance as roomsMap,
  registeredUsersMapInstance as registeredUsersMap,
  usersSocketMapInstance as usersSocketMap,
  usersMapInstance as usersMap,
  ERegistryLevel,
  roomsTasklistMapInstance as roomsTasklistMap,
  TRoomTask,
  EMessageType,
} from './state'
import DeviceDetector from 'device-detector-js'

const { CHAT_ADMIN_TOKEN } = process.env
const isUserAdmin = (token: string) => !!CHAT_ADMIN_TOKEN ? String(token) === CHAT_ADMIN_TOKEN : false

export type TMessage = {
  text: string
  ts: number
  editTs?: number
  rl?: ERegistryLevel
  user: string
}

const deviceDetector = new DeviceDetector()
const getParsedUserAgent = (socket: any): DeviceDetector.DeviceDetectorResult => deviceDetector.parse(socket.handshake.headers['user-agent'])

export const withSocketChat = (io: Socket) => {
  io.on('connection', (socket) => {
    const nameBySocketId = usersSocketMap.get(socket.id)
    if (!!nameBySocketId) {
      usersSocketMap.delete(socket.id)
      usersMap.delete(nameBySocketId)
    }

    socket.on('setMeAgain', ({ name, room, token }, cb) => {
      // ---
      const myRegData = registeredUsersMap.get(name)

      // -- NOTE: Logout if logged already?
      // if (!!myRegData?.token && token) {
      //   if (myRegData.token !== token) {
      //     socket.emit('notification', { status: 'error', title: 'TOKEN is wrong', description: 'EXP: Вы зашли с другого устройства?' })
      //     socket.emit('FRONT:LOGOUT')
      //     return
      //   }
      // }

      // var rooms = io.sockets.adapter.sids[socket.id]
      // for (let r in rooms) {
      //   socket.leave(r)
      // }
      // --

      socket.emit('my.user-data', myRegData || null)
      // ---
      if (!name || !room) {
        cb('Попробуйте перезайти')
        return
      }

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
        roomsMap.set(room, [])
      }

      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
    })
    socket.on('getTsMap', ({ rooms }: { rooms: string[] }) => {
      const tsMap = roomsMap.getTsMap(rooms)

      socket.emit('tsMap', tsMap)
    })
    socket.on('unsetMe', ({ name, room }) => {
      // ---
      try {
        socket.leave(room)
      } catch (err) {
        console.log(err)
      }
      // ---

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

    socket.on('login.password', ({ password, name, room, token }, cb?: (reason?: string, isAdmin?: boolean, token?: string) => void) => {
      if (!name || !room) {
        if (!!cb) cb('Room and Username are required')
        return
      }

      if (!registeredUsersMap.has(name)) {
        if (!!cb) cb('User not fount')
        return
      }

      const { passwordHash, registryLevel, ...rest } = registeredUsersMap.get(name)
      let newToken: string = getRandomString(7)
      if (!bcrypt.compareSync(password, passwordHash)) {
        if (!!cb) cb('Incorrect password')
        return
      }

      socket.join(room)
      const roomData = roomsMap.get(room)
      
      // -- Set new token
      const regData = registeredUsersMap.get(name)

      if (!!regData) registeredUsersMap.set(name, { ...regData, token: newToken })
      // --

      if (!roomData) roomsMap.set(room, [])
      // socket.emit('oldChat', { roomData: roomsMap.get(room) })
      // --- TODO:
      // socket.emit('oldChat', {
      //   roomData: roomsMap.getSomeDay(room, Date.now()).roomData
      // })
      // ---
      
      io.in(room).emit('notification', { status: 'info', description: `${name} just entered the room` })
      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))

      // io.emit('notification', { status: 'info', description: 'Someone\'s here' })

      if (!!cb) cb(null, isUserAdmin(token), newToken)
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

      if (!!token) {
        const regData = registeredUsersMap.get(name)

        if (!!regData && !!regData.token) {
          if (regData.token === token) {
            // Go on...
          } else {
            if (registeredUsersMap.has(name)) {
              if (!!cb) cb('FRONT:LOG/PAS')
              return
            }
          }
        } else {
          if (registeredUsersMap.has(name)) {
            if (!!cb) cb('FRONT:LOG/PAS')
            return
          }
        }
      } else {
        if (registeredUsersMap.has(name)) {
          if (!!cb) cb('FRONT:LOG/PAS')
          return
        }
      }

      socket.join(room)

      const roomData = roomsMap.get(room)

      if (!roomData) roomsMap.set(room, [])
      // socket.emit('oldChat', { roomData: roomsMap.get(room) })
      
      io.in(room).emit('notification', { status: 'info', description: `${name} just entered the room` })
      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
      // io.emit('notification', { status: 'info', description: 'Someone\'s here' })

      if (!!cb) cb(null, isUserAdmin(token))

      // ---
    })
    socket.on('logout', ({ name, token }) => {
      const userConnData = usersMap.get(name)
      // io.emit('notification', { status: 'info', description: 'Someone disconnected' })
      usersSocketMap.delete(socket.id)

      // NOTE: Remove token if necessary?
      // const regData = registeredUsersMap.get(name)
      // if (!!regData && !!regData.token && !!token && token === regData.token) {
      //   const { token, ...rest } = regData
      //   registeredUsersMap.set(name, rest)
      // }

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
        const newRoomData: TMessage[] = roomsMap.get(room)

        let registryLevel = 0
        const regData = registeredUsersMap.get(userName)
        if (registeredUsersMap.has(userName)) {
          registryLevel = 1
          if (!!regData.registryLevel) registryLevel = regData.registryLevel
        }
        
        newRoomData.push({ text: message, ts, rl: registryLevel, user: name })

        roomsMap.set(room, newRoomData)

        io.in(room).emit('message', { user: name, text: message, ts, rl: registryLevel });
        if (!!cb) cb()
      } catch (err) {
        socket.emit('notification', { status: 'error', title: 'ERR #2', description: !!err.message ? `ERR: Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error', _originalEvent: { message, userName } })
        socket.emit('FRONT:LOGOUT')
      }
      // ---
    })

    socket.on('getPartialOldChat', ({ tsPoint, room }: { tsPoint: number, room: string }, cb) => {
      if (!room) {
        socket.emit('notification', { status: 'error', title: 'ERR #4.1', description: 'Params wrong' })
        return
      }

      const { result, nextTsPoint, isDone, errorMsg } = roomsMap.getPartial({ tsPoint, room })

      if (!!errorMsg) {
        socket.emit('notification', { status: 'error', title: 'ERR #4.2', description: errorMsg })
        return
      }
      socket.emit('partialOldChat', { result, nextTsPoint, isDone })
      if (!!cb) cb()
    })

    socket.on('editMessage', ({ room, name, ts, newData }: { room: string, name: string, ts: number, newData: { text: string, type?: EMessageType } }, cb) => {
      const result = roomsMap.editMessage({
        room, name, ts, newData
      })

      if (!result.isOk) {
        if (result.isPrivateSocketCb) {
          // if (!!cb && !!result.errMsgData) cb(result.errMsgData.description)
          socket.emit('notification', { status: 'error', title: result.errMsgData.title, description: result.errMsgData.description })
          if (result.shouldLogout) socket.emit('FRONT:LOGOUT')
        }
      } else {
        io.in(room).emit('message.update', result.targetMessage);
      }
    })
    socket.on('deleteMessage', ({ room, name, ts }, cb) => {
      let roomData = roomsMap.get(room)
      try {
        if (!roomData) {
          if (cb) cb('roomData not found')
          return
        } else {
          const userMessages = roomData
  
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
              roomData = newUserMessages
              roomsMap.set(room, roomData)
              // io.in(room).emit('oldChat', { roomData: roomsMap.get(room) });
              io.in(room).emit('message.delete', { ts });
            }
          }
        }
      } catch (err) {
        socket.emit('notification', { status: 'error', title: 'ERR #3', description: !!err.message ? `ERR: Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error' })
        socket.emit('FRONT:LOGOUT')
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
      const newTask = {
        ts,
        title,
        description,
        isCompleted: false,
        uncheckTsList: [ts],
      }

      if (!!roomTasklist && Array.isArray(roomTasklist)) {
        roomTasklist.push(newTask)
      } else {
        roomTasklist = [newTask]
      }
      roomsTasklistMap.set(room, roomTasklist)
      io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) });
      if (!!cb) cb()
    })
    socket.on("updateTask", ({
      room,
      ts,
      title,
      description,
      isCompleted,
      isLooped,
      checkTsList,
      uncheckTsList,
      resetLooper,
    }: Partial<TRoomTask> & { room: string, resetLooper?: boolean }, cb?: (errMsg?: string) => void) => {
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

          const oldIsCompleted = newTask.isCompleted

          if (!!title) newTask.title = title
          if (!!description) newTask.description = description
          if (!!checkTsList && Array.isArray(checkTsList) && checkTsList.every((e) => Number.isInteger(e))) newTask.checkTsList = checkTsList
          if (!!uncheckTsList && Array.isArray(uncheckTsList) && uncheckTsList.every((e) => Number.isInteger(e))) newTask.uncheckTsList = uncheckTsList
          if (isLooped === true || isLooped === false) newTask.isLooped = isLooped

          if (isCompleted === true || isCompleted === false) {
            newTask.isCompleted = isCompleted

            const newTs = Date.now()

            if (resetLooper) {
              // 1.
              if (!!newTask.fixedDiff) delete newTask.fixedDiff
              newTask.uncheckTsList = [newTs]
              newTask.isCompleted = false
              if (!!newTask.uncheckTsList) delete newTask.checkTsList
            } else {
              if (oldIsCompleted !== isCompleted) {
                // NOTE: Update timestamps
                const targetField = isCompleted ? 'checkTsList' : 'uncheckTsList'
                // const tsList = newTask[targetField]
                
                const isChecked = isCompleted
  
                // V1:
                // const limit = 2
                // if (!!tsList && Array.isArray(tsList) && tsList.every((e) => Number.isInteger(e)) && tsList.length <= limit) {
                //   if (tsList.length < limit) {
                //     newTask[targetField].push(newTs)
                //   } else {
                //     newTask[targetField].shift()
                //     newTask[targetField].push(newTs)
                //   }
                // } else {
                //   newTask[targetField] = [newTs]
                // }
  
                // V2:
                // 2.1.
                if (isChecked) {
                  // 2.1.1 Update check point:
                  newTask[targetField] = [newTs]
                  if (!newTask.fixedDiff) {
                    newTask.fixedDiff = newTs - newTask.uncheckTsList[0]
                  } else {
                    // 2.1.2 Update uncheck point:
                    newTask.uncheckTsList = [newTask.checkTsList[0] - newTask.fixedDiff]
                  }
                }
                // 2.2.
                if (!isChecked) {
                  newTask[targetField] = [newTs]
                  if (!!checkTsList && Array.isArray(checkTsList)) {
                    if (!!newTask.fixedDiff) {
                      newTask.checkTsList = [newTask.uncheckTsList[0] + newTask.fixedDiff]
                    }
                  }
                }
              }
            }
          }

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