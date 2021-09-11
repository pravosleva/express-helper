import { Socket } from 'socket.io'

type TRoomState = {
  users: { [socketId: string]: string }
}
type TPut = { userName: string, roomName: string, socket: Socket }
type TRemove = { roomName: string, socket: Socket }

export class Singleton {
  private static instance: Singleton;
  state: Map<string, TRoomState>;

  private constructor() {
    this.state = new Map()
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();

    return Singleton.instance;
  }

  public putUserToRoom({ userName, roomName, socket }: TPut) {
    const oldRoom = this.state.get(roomName)

    if (!!oldRoom?.users) {
      this.state.set(roomName, {
        users: {
          ...oldRoom.users,
          [socket.id]: userName,
        }
      })
    } else {
      this.state.set(roomName, {
        users: { [socket.id]: userName }
      })
    }
  }

  public getUserNameOrErr({ roomName, socket }: { roomName: string, socket: Socket }) {
    let result = 'ERR'
    const oldRoom = this.state.get(roomName)

    if (!!oldRoom?.users[socket.id]) result = oldRoom.users[socket.id]

    return result
  }

  public removeUserFromRoom({ roomName, socket }: TRemove) {
    const oldRoom = this.state.get(roomName)

    if (!!oldRoom?.users) {
      const newUsers = { ...oldRoom.users }

      delete newUsers[socket.id]

      this.state.set(roomName, {
        users: { ...newUsers }
      })
    }
  }

  public createRoom({ roomName }) {
    const oldRoom = this.state.get(roomName)
    const initialRoomState: TRoomState = {
      users: {}
    }

    if (!oldRoom) this.state.set(roomName, initialRoomState)
  }

  public deleteRoom({ roomName }) {
    const oldRoom = this.state.get(roomName)

    if (!!oldRoom) this.state.delete(roomName)
  }

  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[key] = value
    })

    return state
  }

  public getRoomlist() {
    const rooms = []

    for (const [roomName, _obj] of this.state) {
      // console.log(roomName, _obj) // { roomName: 'TEST ROOM', userName: 'tstUser' } { users: { iFQp16gjHJHUEMSWAAAB: undefined } }
      rooms.push(roomName)
    }

    return rooms
  }
}

export const socketChatRoomsState = Singleton.getInstance()
