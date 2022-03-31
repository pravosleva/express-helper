type TCheckRoomStateBody = {
  room_id: string
  tsUpdate: number
}

export type TWorkerFnParams = {
  url: string
  body: TCheckRoomStateBody
  method: 'POST' | 'GET'
}