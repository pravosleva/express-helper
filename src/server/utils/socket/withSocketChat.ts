import { instrument } from '@socket.io/admin-ui'
import { Socket } from 'socket.io'
import {
  // addUser, getUser, deleteUser, getUsers,
  TUser,
} from './users'

type TUserName = string
type TConnectionData = Partial<TUser>
type TRoomId = string
type TMessage = {
  text: string
  ts: number
}
type TRoomData = {
  [userName: string]: TMessage[]
}
type TSocketId = string
const usersSocketMap = new Map<TSocketId, TUserName>()
const usersMap = new Map<TUserName, TConnectionData>()
const roomsMap = new Map<TRoomId, TRoomData>()

export const withSocketChat = (io: Socket) => {
  io.on('connection', (socket) => {
    // socket.join('room13')

    const nameBySocketId = usersSocketMap.get(socket.id)
    if (!!nameBySocketId) {
      usersSocketMap.delete(socket.id)
      usersMap.delete(nameBySocketId)
    }

    socket.on('setMeAgain', ({ name, room }) => {
      console.log('-- setMeAgain')
      socket.join(room) // NOTE: Только для этого
      usersSocketMap.set(socket.id, name)

      const existingUser = usersMap.get(name)
      // console.log(existingUser)

      if (!!existingUser) {
        usersMap.set(name, { ...existingUser, name, room, socketId: socket.id })
      } else {
        usersMap.set(name, { name, room, socketId: socket.id })
      }

      const roomData = roomsMap.get(room)
      if (!roomData) {
        roomsMap.set(room, { [name]: [] })
      } else {
        const newUserRoomData = roomData[name]
        if (!newUserRoomData) roomData[name] = []
        
        roomsMap.set(room, roomData)
      }

      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })))
    })
    socket.on('unsetMe', ({ name, room }) => {
      const nameBySocketId = usersSocketMap.get(socket.id)
      if (!!nameBySocketId) {
        usersSocketMap.delete(socket.id)
        usersMap.delete(nameBySocketId)
      }

      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })))
    })

    socket.on('login', ({ name, room }, cb) => {
      // --- NEW WAY
      if (usersMap.has(name)) {
        cb(`Username ${name} already taken`)
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
      // console.log('-- usersMap:', usersMap.size)
      // console.log(usersMap.get(name))
      socket.emit('oldChat', { roomData: roomsMap.get(room) })
      
      io.in(room).emit('notification', { status: 'info', description: `${name} just entered the room`, users: [...usersMap.keys()].map((str: string) => ({ name: str, room })) })
      io.in(room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room })))

      // io.emit('notification', { status: 'info', description: 'Someone\'s here', users: [...usersMap.keys()].map((str: string) => ({ name: str, room })) })

      if (!!cb) cb()

      // ---

      // const { user, error } = addUser({ socketId: socket.id, name, room })
      // if (error) return callback(error)
    })
    socket.on('logout', ({ name }) => {
      const userConnData = usersMap.get(name)
      // io.emit('notification', { status: 'info', description: 'Someone disconnected' })
      usersSocketMap.delete(socket.id)

      if (!!userConnData) {
        usersMap.delete(name)
        if (!!userConnData?.room) {
          socket.leave(userConnData.room)
          io.in(userConnData.room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room: usersMap.get(str).room })))
          io.in(userConnData.room).emit('notification', { status: 'info', description: `${name} just left the room`, _originalEvent: { name } })
        }
      }
    })

    socket.on('sendMessage', ({ message, userName }) => {
      // --- NEW WAY
      const ts = Date.now()
      try {
        // console.log(usersMap.size, userName, usersMap.get(userName))
        const { room, name } = usersMap.get(userName)

        // console.log('-- sendSMessage, userData:')
        // console.log(usersMap.get(userName))

        const newRoomData = roomsMap.get(room)

        // console.log('-- newRoomData before')
        // console.log(newRoomData)

        newRoomData[name].push({ text: message, ts })

        // console.log('-- newRoomData after')
        // console.log(newRoomData)

        roomsMap.set(room, newRoomData)

        // console.log('-- roomsMap after')
        // console.log(roomsMap.get(room))

        io.in(room).emit('message', { user: name, text: message, ts });
      } catch (err) {
        socket.emit('notification', { status: 'error', title: 'ERR #1', description: err.message || 'Server error', _originalEvent: { message, userName } })
      }
      // ---
    })

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
            io.in(userConnData.room).emit('users', [...usersMap.keys()].map((str: string) => ({ name: str, room: userConnData.room })))
          }
        }
    })
  })

  // @ts-ignore
  instrument(io, {
    auth: false,
    // namespace: '/admin',
  })
}