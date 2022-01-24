export enum ERegistryLevel {
  Guest = 0,
  Logged = 1,
  TGUser = 2
}

export enum EMessageStatus {
  Info = 'info',
  Success = 'success',
  Warn = 'warning',
  Danger = 'danger',
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
}

export type TImageLightboxFormat = { src: string, alt: string | undefined }

export type TRegistryData = {
  passwordHash: string
  registryLevel?: ERegistryLevel
  tokens?: string[]
  tg?: {
    username: string
    chat_id: number
  }
}
