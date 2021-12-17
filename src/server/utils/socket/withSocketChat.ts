import { instrument } from '@socket.io/admin-ui'
import { Socket } from 'socket.io'
import bcrypt from 'bcryptjs'
import { binarySearchTsIndex } from '~/utils/binarySearch'
import {
  roomsMapInstance as roomsMap,
  registeredUsersMapInstance as registeredUsersMap,
  usersSocketMapInstance as usersSocketMap,
  usersMapInstance as usersMap,
  ERegistryLevel,
  roomsTasklistMapInstance as roomsTasklistMap,
  TRoomTask,
  EMessageStatus,
  TConnectionData,
  TMessage,
  TUploadFileEvent,
} from './state'
import siofu from 'socketio-file-upload'
import path from 'path'
import { createDirIfNecessary } from '~/utils/fs-tools/createDirIfNecessary'
import { removeFileIfNecessary } from '~/utils/fs-tools/removeFileIfNecessary'
import { getParsedUserAgent, getToken, standardResultHandler } from './utils'

const { CHAT_ADMIN_TOKEN } = process.env
const isUserAdmin = (token: string) => !!CHAT_ADMIN_TOKEN ? String(token) === CHAT_ADMIN_TOKEN : false
const CHAT_UPLOADS_DIR_NAME = process.env.CHAT_UPLOADS_DIR_NAME || 'uploads'

// -- Create uploads dir if necessary
const projectRootDir = path.join(__dirname, '../../../')
const uploadsPath = path.join(projectRootDir, `/storage/${CHAT_UPLOADS_DIR_NAME}`)
createDirIfNecessary(uploadsPath)
// --

const uploadProgressMap = new Map<string, { connData: TConnectionData, status: string, event: any, ts: number }>()

export const withSocketChat = (io: Socket) => {
  // -- NOTE: Logout on front
  const logoutOld = (socketId: string) => {
    io.to(socketId).emit('FRONT:LOGOUT')
  }
  // --
  io.on('connection', (socket) => {
    const nameBySocketId = usersSocketMap.get(socket.id)
    if (!!nameBySocketId) {
      usersSocketMap.delete(socket.id)
      usersMap.delete(nameBySocketId)
    }

    // -- Uploader init (part 2/2)
    const uploader = new siofu()
    uploader.dir = uploadsPath
    const LIMIT_UPLOAD_FILE_SIZE_MB = 10
    uploader.maxFileSize = LIMIT_UPLOAD_FILE_SIZE_MB * 1024 * 1024;
    uploader.listen(socket)
    uploader.on("start", function(event: TUploadFileEvent){
      if (/\.exe$/.test(event.file.name)) {
        uploader.abort(event.file.id, socket)
      } else if (event.file.size > LIMIT_UPLOAD_FILE_SIZE_MB * 1024 * 1024) {
        uploader.abort(event.file.id, socket)
        socket.emit('upload:error', { message: `Limit ${LIMIT_UPLOAD_FILE_SIZE_MB} MB; You gonna load ${(event.file.size / (1024 * 1024)).toFixed(0)} MB` })
      } else {
        try {
          const ext = event.file.name.split('.').reverse()[0]
          const ts = Date.now()
          // const nowDate = new Date(ts)
          const getUserNameBySocketId = (socketId: string) => {
            let connData: TConnectionData | null = null
            const result: any = {}

            for(const [_key, value] of usersMap.state) {
              const { socketId: _socketId } = value
              
              if (socketId === _socketId) connData = value
            }

            result.isOk = !!connData
            if (!!connData) {
              result.connData = connData
            } else {
              result.message = 'Use conn data not found in state: Try relogin'
            }

            return result
          }
          const detected = getUserNameBySocketId(socket.id)
          if (detected.isOk) {
            const newName = `${ts}.${ext}`

            event.file.name = newName

            uploadProgressMap.set(newName, {
              connData: detected.connData,
              status: 'strated',
              event,
              ts,
            })
            socket.emit('upload:started')
          } else {
            throw new Error('ERR#707: FUCKUP')
          }
        } catch (err) {
          console.log(err)
          uploader.abort(event.file.id, socket)
        }
      }
    });
    uploader.on("progress", function(ev){
      const { file: { id, size, bytesLoaded } } = ev
      socket.emit('upload:progress', { id: id, percentage: (bytesLoaded / size) * 100 })
    })
    uploader.on("saved", function(event){
      const progressData = uploadProgressMap.get(event.file.name)

      if (!!progressData) {
        // -- Create msg -> send all
        try {
          const { connData: { room, name } } = progressData
          const newRoomData: TMessage[] = roomsMap.get(room)

          let registryLevel = 0
          const regData = registeredUsersMap.get(name)
          if (registeredUsersMap.has(name)) {
            registryLevel = 1
            if (!!regData.registryLevel) registryLevel = regData.registryLevel
          }
          
          const msg = ''
          newRoomData.push({ text: msg, ts: progressData.ts, rl: registryLevel, user: name, fileName: event.file.name })

          roomsMap.set(room, newRoomData)

          io.in(room).emit('message', { user: name, text: msg, ts: progressData.ts, rl: registryLevel, fileName: event.file.name });
        } catch (err) {
          // socket.emit('notification', { status: 'error', title: 'ERR #2', description: !!err.message ? `ERR: Попробуйте перезайти. Скорее всего, ошибка связана с Logout на одном из устройств; ${err.message}` : 'Server error', _originalEvent: { message, userName } })
          socket.emit('FRONT:LOGOUT')
        }
        // --

        uploadProgressMap.delete(event.file.name)
      }

      event.file.clientDetail.base = event.file.base
      socket.emit('upload:saved')
    });
    uploader.on("error", function(ev){
      const msgs = [ev.error.message || 'No error message in event', `Limit ${LIMIT_UPLOAD_FILE_SIZE_MB} MB`] 
      socket.emit('upload:error', { message: msgs.join('; '), event: ev })
    });
    // --

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

      io.in(room).emit('users:room', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
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

      io.in(room).emit('users:room', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
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
      const newToken: string = getToken(name)

      if (!bcrypt.compareSync(password, passwordHash)) {
        if (!!cb) cb('Incorrect password')
        return
      } else {
        // -- LOGOUT OLD
        const existingUser = usersMap.get(name)
        if (!!existingUser) {
          const oldSocketId = existingUser.socketId

          if (oldSocketId !== socket.id) logoutOld(oldSocketId)
        }
        // --
      }

      socket.join(room)
      const roomData = roomsMap.get(room)
      
      // -- Set new token
      const regData = registeredUsersMap.get(name)

      if (!!regData) {
        let newTokens = [newToken]
        if (!!regData.tokens && Array.isArray(regData.tokens)) {
          newTokens = [newToken, ...regData.tokens]
        }
        // -- NOTE: Убрать старые токены
        if (newTokens.length > 5) {
          const numberToRemove = 5 - newTokens.length
          newTokens = newTokens.splice(0, numberToRemove)
        } 
        // --
        registeredUsersMap.set(name, { ...regData, tokens: [...new Set(newTokens)] })
      }
      // --

      if (!roomData) roomsMap.set(room, [])
      // socket.emit('oldChat', { roomData: roomsMap.get(room) })
      // --- TODO:
      // socket.emit('oldChat', { roomData: roomsMap.getSomeDay(room, Date.now()).roomData })
      // ---
      
      // io.in(room).emit('notification', { status: 'info', description: `${name} just entered the room` })
      io.in(room).emit('users:room', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
      socket.emit('my.user-data', registeredUsersMap.get(name) || null)

      // io.emit('notification', { status: 'info', description: 'Someone\'s here' })

      if (!!cb) cb(null, isUserAdmin(token), newToken)
    })

    socket.on('login', ({ name, room, token }, cb?: (reason?: string, isAdmin?: boolean) => void) => {
      if (!name || !room) {
        if (!!cb) cb('Room and Username are required')
        return
      }

      // --- NEW WAY
      if (usersMap.has(name) && !token) {
        if (!!cb) cb(`Username ${name} already taken`)
        return
      }

      if (!!token) {
        const regData = registeredUsersMap.get(name)

        if (!!regData && !!regData.tokens) {
          if (regData.tokens.includes(token)) {
            // Go on...
            // -- LOGOUT OLD
            const existingUser = usersMap.get(name)
            if (!!existingUser) {
              const oldSocketId = existingUser.socketId

              if (oldSocketId !== socket.id) logoutOld(oldSocketId)
            }
            // --
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
      
      // io.in(room).emit('notification', { status: 'info', description: `${name} just entered the room` })
      io.in(room).emit('users:room', [...usersMap.keys()].map((str: string) => ({ name: str, room })).filter(({ room: r }) => r === room))
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
          io.in(userConnData.room).emit('users:room', [...usersMap.keys()].map((str: string) => ({ name: str, room: usersMap.get(str).room })).filter(({ room }) => room === userConnData.room))
          // io.in(userConnData.room).emit('notification', { status: 'info', description: `${name} just left the room`, _originalEvent: { name } })
        }
      }
    })

    socket.on('users.room', ({ room }) => {
      socket.emit('users:room', [...usersMap.keys()].map((str: string) => ({ name: str, room: usersMap.get(str).room })).filter(({ room: r }) => room === r))
    })

    socket.on('users.search', ({ searchText }: { searchText: string }, cb: ({ users }: { users: string[], isErrored?: boolean, message?: string }) => void) => {
      if (!!searchText) {
        if (!!cb) cb({ users: registeredUsersMap.getUsers(searchText) })
      } else {
        if (!!cb) cb({ users: [], isErrored: true, message: 'searchText is empty!' })
      }

      // socket.emit('users:search', { users: [] })
    })
    // socket.on('messages.assign-to-user', ({ userName, room, msgState }) => {
    //   const result = roomsMap.editMessage({ room, name: userName, ts: msgState.ts, newData: msgState })

    //   if (!result.isOk) {
    //     if (result.isPrivateSocketCb) {
    //       // if (!!cb && !!result.errMsgData) cb(result.errMsgData.description)
    //       socket.emit('notification', { status: 'error', title: result.errMsgData.title, description: result.errMsgData.description })
    //       if (result.shouldLogout) socket.emit('FRONT:LOGOUT')
    //     }
    //   } else {
    //     io.in(room).emit('message.update', result.targetMessage);
    //   }
    // })

    socket.on('getAllInfo', () => {
      socket.emit('allUsers', [...usersMap.keys()].map((str: string) => ({ name: str, room: usersMap.get(str).room, userAgent: usersMap.get(str).userAgent })))
      socket.emit('allRooms', { roomsData: [...roomsMap.keys()].reduce((acc, roomName) => { acc[roomName] = roomsMap.get(roomName); return acc }, {}) })
    })

    socket.on('sendMessage', ({ message, userName, status }: { message: string, userName: string, status: EMessageStatus }, cb) => {
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

        const newStuff: TMessage = { text: message, ts, rl: registryLevel, user: name }
        if (!!status) newStuff.status = status
        
        newRoomData.push(newStuff)

        roomsMap.set(room, newRoomData)

        io.in(room).emit('message', newStuff);
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

    socket.on('editMessage', ({ room, name, ts, newData }: { room: string, name: string, ts: number, newData: { text: string, status?: EMessageStatus, assignedTo?: string[] } }, cb?: () => void) => {
      const result = roomsMap.editMessage({ room, name, ts, newData })

      standardResultHandler({
        result,
        cbSuccess: ({ result }) => {
          io.in(room).emit('message.update', result.targetMessage);
        },
        cbError: ({ result }) => {
          if (result.isPrivateSocketCb) {
            // if (!!cb && !!result.errMsgData) cb(result.errMsgData.description)
            socket.emit('notification', { status: 'error', title: result.errMsgData.title, description: result.errMsgData.description })
            if (result.shouldLogout) socket.emit('FRONT:LOGOUT')
          }
        },
      })
      if (!!cb) cb()
    })
    socket.on('deleteMessage', ({ room, name, ts }, cb) => {
      const result = roomsMap.deleteMessage({ roomId: room, ts })

      standardResultHandler({
        result,
        cbSuccess: ({ result }) => {
          // io.in(room).emit('oldChat', { roomData: roomsMap.get(room) });
          io.in(room).emit('message.delete', { ts });

          // -- NOTE: DELETE FILE!
          if (!!result.targetMessage.fileName) {
            const storagePath = uploadsPath

            removeFileIfNecessary(path.join(storagePath, result.targetMessage.fileName))
          }
          // --
        },
        cbError: ({ result }) => {
          if (cb) cb(result.errMsgData?.description || 'ERR')

          if (result.isPrivateSocketCb) {
            socket.emit('notification', { status: 'error', title: result.errMsgData?.title || 'ERR #3', description: result.errMsgData?.description || 'Server error' })
          }
          if (result.shouldLogout) socket.emit('FRONT:LOGOUT')
        },
      })
    })

    // --- NOTE: TASKLIST
    socket.on("createTask", ({ room, title, description }: Partial<TRoomTask> & { room: string }, cb?: (errMsg?: string) => void) => {
      if (!room || !title) {
        if (!!cb) cb('ERR: title & room are required')
        return
      }

      let roomTasklist = roomsTasklistMap.get(room)
      const ts = Date.now()
      const newTask: TRoomTask = {
        ts,
        title,
        description,
        isCompleted: false,
        uncheckTs: ts,
      }

      if (!!roomTasklist && Array.isArray(roomTasklist)) {
        roomTasklist.push(newTask)
        io.in(room).emit('tasklist.add-item', { task: newTask })
      } else {
        roomTasklist = [newTask]
        io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) })
      }
      roomsTasklistMap.set(room, roomTasklist)
      // io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) })
      
      if (!!cb) cb()
    })
    socket.on("updateTask", ({
      room,
      ts,
      title,
      description = '',
      isCompleted,
      isLooped,
      checkTs,
      uncheckTs,
      resetLooper,
      price,
      newFixedDiffTs,
    }: Partial<TRoomTask> & { room: string, resetLooper?: boolean, newFixedDiffTs?: number }, cb?: (errMsg?: string) => void) => {
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
        const newTs = Date.now()

        if (theTaskIndex !== -1) {
          newTask = roomTasklist[theTaskIndex]

          const oldIsCompleted = newTask.isCompleted

          if (!!title) newTask.title = title
          if (!!description) newTask.description = description
          if (!!checkTs && typeof checkTs === 'number') newTask.checkTs = checkTs
          if (!!uncheckTs && typeof uncheckTs === 'number') newTask.uncheckTs = uncheckTs
          if (isLooped === true || isLooped === false) newTask.isLooped = isLooped
          if (Number.isInteger(price)) newTask.price = price

          if (!!newFixedDiffTs) {
            newTask.fixedDiff = newFixedDiffTs
            if (!!checkTs && typeof checkTs === 'number') {
              // newTask.checkTs = [newTask.uncheckTs + ]

              if (newTask.isCompleted) {
                newTask.uncheckTs = newTs - newTask.fixedDiff
                newTask.checkTs = newTs
              } else {
                newTask.uncheckTs = newTs
                newTask.checkTs = newTask.uncheckTs + newTask.fixedDiff
              }

            }
          }

          if (isCompleted === true || isCompleted === false) {
            newTask.isCompleted = isCompleted

            if (resetLooper) {
              // 1.
              if (!!newTask.fixedDiff) delete newTask.fixedDiff
              newTask.uncheckTs = newTs
              newTask.isCompleted = false
              if (!!newTask.uncheckTs) delete newTask.checkTs
            } else {
              if (oldIsCompleted !== isCompleted) {
                // NOTE: Update timestamps
                const targetField = isCompleted ? 'checkTs' : 'uncheckTs'
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
                  newTask[targetField] = newTs
                  if (!newTask.fixedDiff) {
                    newTask.fixedDiff = newTs - newTask.uncheckTs
                  } else {
                    // 2.1.2 Update uncheck point:
                    newTask.uncheckTs = newTask.checkTs - newTask.fixedDiff
                  }
                }
                // 2.2.
                if (!isChecked) {
                  newTask[targetField] = newTs
                  if (!!checkTs && typeof checkTs === 'number') {
                    if (!!newTask.fixedDiff) {
                      newTask.checkTs = newTask.uncheckTs + newTask.fixedDiff
                    }
                  }
                }
              }
            }
          }

          newTask.editTs = editTs

          roomTasklist[theTaskIndex] = newTask
          roomsTasklistMap.set(room, roomTasklist)

          // io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) })
          io.in(room).emit('tasklist.update-item', { task: newTask })
        } else {
          if (!!title || !!description) cb('ERR: theTaskIndex NOT FOUND')
          return
        }
      } else {
        if (!title) {
          cb('ERR: roomTasklist NOT FOUND; title param are required')
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
            // io.in(room).emit('tasklist', { tasklist: roomsTasklistMap.get(room) });
            io.in(room).emit('tasklist.delete-item', { ts })
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
              io.in(userConnData.room).emit('users:room', [...usersMap.keys()].map((str: string) => ({ name: str, room: userConnData.room })).filter(({ room }) => room === userConnData.room))
            }
          }
        }
    })
  })

  // @ts-ignore
  instrument(io, { auth: false, namespace: '/admin' })
}