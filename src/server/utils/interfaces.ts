import { Request as IRequest } from 'express'
import { Singleton } from './addsDevicesLoggedStateInstance'

export interface ICustomRequest extends IRequest {
  id: string;
  loggedMap: Singleton
  success_url?: string
  swaggerDoc?: any
  query: {
    [key: string]: any
  }
}

export type THelp = {
  params: {
    body?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
      }
    };
    query?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
      }
    }
  }
  res?: {
    [key: string]: any
  }
}
