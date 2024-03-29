export enum ERegistryLevel {
  Guest = 0,
  Logged = 1,
  TGUser = 2
}

export enum EMessageStatus {
  Info = 'info',
  Warn = 'warning',
  Danger = 'danger',
  Success = 'success',
  Dead = 'dead',
  Done = 'done',
}

export type TMessage = {
  user: string;
  text: string;
  ts: number;
  editTs?: number;
  name: string;
  status?: EMessageStatus;
  file?: {
    fileName: string;
    filePath: string;
  };
  assignedTo?: string[];
  assignedBy?: string;
  original?: TMessage;
  links?: { link: string, descr: string }[];
  position?: number
  statusChangeTs?: number
}

export type TImageLightboxFormat = { src: string, alt: string | undefined }

export type TRegistryData = {
  passwordHash: string
  registryLevel?: ERegistryLevel
  tg?: {
    username: string
    chat_id: number
  }
}
