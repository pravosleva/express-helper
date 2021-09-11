import { Socket } from 'socket.io'
import { socketChatRoomsState as chatRooms } from './socketChatRoomsState'

enum ESocketEvents {
  YOURE_WELCOME = 'emit.youre-welcome',
  NEW_USER_IN_ROOM = 'action.new-user-in-room',
  ADD_USER_TO_ROOM = 'action.add-user-in-room',
  SEND_CHAT_MSG = 'action.send-chat-message',
  CHAT_MSG = 'emit.chat-message',
  USER_DISCONNECTED = 'emit.user-disconnected',
  ROOM_CREATED = 'emit.room-created',
  GET_CHAT_ROOMS_STATE = 'emit.get-chat-rooms-state'
}

const EE = ESocketEvents

const getUserRooms = (socket: Socket) => {
  const rooms = []
  const chatEntries = chatRooms.state.entries()

  for (const [roomName, obj] of chatEntries) {
    if (!!obj.users[socket.id]) rooms.push(roomName)
  }
  return rooms
}

export const withSocketChatRooms = (io: Socket) => {
  io.on('connection', (socket) => {
    console.log('-- CONNECT --')
    socket.emit(EE.YOURE_WELCOME, { chatRooms: chatRooms.getState(), info: { total: chatRooms.state.size, roomlist: chatRooms.getRoomlist() } })

    socket.on(EE.ADD_USER_TO_ROOM, ({ roomName, userName }: { roomName: string, userName: string }) => {
      console.log('-- ADD_USER_TO_ROOM ---', roomName)
      socket.join(roomName)
      chatRooms.putUserToRoom({ userName, roomName, socket })
      
      socket.in(roomName).emit(EE.NEW_USER_IN_ROOM, { userName, roomName, chatRooms: chatRooms.getState() })
    })

    socket.on(EE.SEND_CHAT_MSG, ({ roomName, message }: { roomName: string, message: string }) => {
      socket.in(roomName).emit(EE.CHAT_MSG, {
        message,
        userName: chatRooms.getUserNameOrErr({ roomName, socket })
      })
    })

    socket.on(EE.GET_CHAT_ROOMS_STATE, (data) => {
      console.log('-- GET_CHAT_ROOMS_STATE --')
      console.log(data)
      // socket.emit(EE.YOURE_WELCOME, {
      //   chatRooms: chatRooms.getState(),
      //   // info: { total: chatRooms.state.size, roomlist: chatRooms.getRoomlist() }
      // })
      io.in(data.roomName).emit(EE.YOURE_WELCOME, { chatRooms: chatRooms.getState(), info: { total: chatRooms.state.size, roomlist: chatRooms.getRoomlist() } })
    })

    socket.on('disconnect', () => {
      console.log('-- DISCONNECT')
      getUserRooms(socket)
        .forEach((roomName) => {
          io.to(roomName).emit(EE.USER_DISCONNECTED, chatRooms.getUserNameOrErr({ roomName, socket }))
          chatRooms.removeUserFromRoom({ roomName, socket })
        })
    })
  })
}