export enum EAPILoginCode {
  IncorrectParams = 'incorrect_params',
  NotFound = 'not_found',
  ServerError = 'server_error',
  IncorrectPassword = 'incorrect_password',
  Logged = 'logged'
}
export enum ELoggedCookie {
  JWT = 'chat.jwt'
}

export type TUser = {
  tg_chat_id: string
  room: string
  user: string
}