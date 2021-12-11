import DeviceDetector from 'device-detector-js'

export enum EMessageStatus {
  Info = 'info',
  Success = 'success',
  Warn = 'warning',
  Danger = 'danger',
  Dead = 'dead',
  Done = 'done',
}
// enum EMessageType {
//   Text = 'text',
//   Photo = 'photo',
// }

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
  user: string
  status?: EMessageStatus
  // type?: EMessageType
  assignedTo?: string[]
  assignedBy?: string
}
// export type TRoomData = {
//   [userName: string]: TMessage[]
// }
export type TRoomData = TMessage[]
export type TRegistryData = {
  passwordHash: string
  registryLevel?: ERegistryLevel
  tokens?: string[]
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

  // NOTE: New feature - auto uncheck looper
  isLooped?: boolean
  checkTsList?: number[]
  uncheckTsList?: number[]
  fixedDiff?: number
  price?: number
}
export type TRoomTasklist = TRoomTask[]
