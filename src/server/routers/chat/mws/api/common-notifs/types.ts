import { TMessage } from "~/utils/socket/state/types"

export enum EAPIRoomNotifsCode {
  IncorrectParams = 'incorrect_params',
  NotFound = 'not_found',
  NoUpdates = 'no_updates',
  Updated = 'updated',

  Errored = 'errored',
  Exists = 'exists',
}

export type TNotifItem = {
  ts: number
  username: string
  tsTarget: number
  text: string
  original: TMessage
}
export type TData = { [key: string]: TNotifItem }
export type TRoomNotifs = {
  tsUpdate: number
  data: TData
}
