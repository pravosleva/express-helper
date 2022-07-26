export enum EAPIUserCode {
  UserExists = 'already_exists',
  IncorrecrParams = 'incorrect_params',
  IncorrecrBody = 'incorrect_body',
  Updated = 'updated',
  Created = 'created',

  NotFound = 'not_found',
  IncorrectUserName = 'incorrect_username',
  Removed = 'removed',
  ServerError = 'server_error'
}

export enum EAPIRoomCode {
  RoomExists = 'room_exists',
  IncorrecrParams = 'incorrect_params',
  NotFound = 'not_found'
}