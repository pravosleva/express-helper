import { TRegistryData } from '~/utils/interfaces'

export enum EAPIUserCode {
  Logged = 'logged',
  Unlogged = 'unlogged',
  IncorrectParams = 'incorrect_params',
  NeedLogout = 'need_logout',
}

export type TUserResData = {
  code: EAPIUserCode;
  ok: boolean;
  message?: string;
  regData?: TRegistryData;
}
