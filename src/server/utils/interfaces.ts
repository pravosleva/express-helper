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