import { useEffect, useCallback, useState } from 'react'
import { io } from 'socket.io-client'
import { Socket } from 'socket.io-client'

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

export type TChatRooms = {
  [roomName: string]: {
    users: { [socketId: string]: string }
  }
}

export const EE = ESocketEvents

const REACT_APP_SOCKET_ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || '/'

export const useSocket = () => {
  const socket: Socket = io(REACT_APP_SOCKET_ENDPOINT, {
    autoConnect: true,
    transports: ['websocket', 'polling']
  })
  const [chatRooms, setChatRooms] = useState<TChatRooms>({})

  const onYoureWelcome = (data: { chatRooms: TChatRooms, info: { total: number, roomslist: string[] } }) => {
    console.log('- YOURE_WELCOME')
    console.log(data)
    const { chatRooms } = data

    setChatRooms(chatRooms)
  }
  const onUserAddedToRoom = (data: any) => {
    console.log('- New user in room')
    console.log(data)
    const { chatRooms } = data

    setChatRooms(chatRooms)
  }
  const onDisconnect = () => {
    console.log('- DISCONNECT')
  }

  useEffect(() => {
    // console.log('EFFECT')
    socket.on(EE.YOURE_WELCOME, onYoureWelcome)
    socket.on(EE.NEW_USER_IN_ROOM, onUserAddedToRoom)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off(EE.YOURE_WELCOME, onYoureWelcome)
      socket.off(EE.NEW_USER_IN_ROOM, onUserAddedToRoom)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return {
    socket,
    chatRooms,
  }
}