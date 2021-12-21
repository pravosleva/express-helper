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
  status: EMessageStatus;
  fileName?: string;
  filePath?: string;
  assignedTo?: string[];
  assignedBy?: string;
}

export type TImageLightboxFormat = { src: string, alt: string | undefined }