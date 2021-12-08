export enum EMessageStatus {
  Info = 'info',
  Success = 'success',
  Warn = 'warning',
  Danger = 'danger',
  Dead = 'dead',
  Done = 'done',
}

export type TMessage = { user: string; text: string; ts: number; editTs?: number; name: string, status: EMessageStatus, fileName?: string }

export type TImageLightboxFormat = { src: string, alt: string | undefined }