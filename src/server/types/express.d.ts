import * as express from '~/types/express'

declare global {
  namespace Express {
    interface Request {
      botStorageFilePath?: string
      autopark2022StorageFilePath?: string
    }
  }
}