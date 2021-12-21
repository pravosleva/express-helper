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
  fileName?: string
  filePath?: string
}
// export type TRoomData = {
//   [userName: string]: TMessage[]
// }
export type TRoomData = TMessage[]
export type TRegistryData = {
  passwordHash: string
  registryLevel?: ERegistryLevel
  tokens?: string[]
  tg?: {
    username: string
    chat_id: number
  }
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
  checkTs?: number
  uncheckTs?: number
  fixedDiff?: number
  price?: number
}
export type TRoomTasklist = TRoomTask[]

export type TOperstionResult = {
  isOk: boolean
  isPrivateSocketCb: boolean
  shouldLogout: boolean
  targetMessage: TMessage
  errMsgData?: { title?: string, description?: string }
}

export type TUploadFileEvent = {
  file: {
    name: string // 'broken-screen-hor-inv-x1920-x-1080.jpg',
    mtime: string // 2020-07-25T17:14:33.606Z,
    encoding: string // 'octet',
    clientDetail: any // {},
    meta: any // {},
    id: number // 0,
    size: number // 835009,
    bytesLoaded: number // 0,
    success: boolean // true
  }
}