import DeviceDetector from 'device-detector-js'

export type TRoomId = string
export enum ERegistryLevel {
  Guest = 0,
  Logged = 1,
  TGUser = 2
}
export type TMessage = {
  text: string
  ts: number
  editTs?: number
  rl?: ERegistryLevel
}
export type TRoomData = {
  [userName: string]: TMessage[]
}

export type TRegistryData = {
  passwordHash: string
  registryLevel?: ERegistryLevel
  token?: string
}
export type TUserName = string

export type TSocketId = string

type TUser = {
  socketId: string
  name: string
  room: string
}
export type TConnectionData = Partial<TUser> & { userAgent: DeviceDetector.DeviceDetectorResult }

export type TRoomTask = {
  title: string
  description?: string
  isCompleted: boolean
  ts: number
  editTs?: number
}
export type TRoomTasklist = TRoomTask[]
