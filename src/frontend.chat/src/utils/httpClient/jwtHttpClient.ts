import axios, { CancelTokenSource } from 'axios'
import { EAPIUserCode } from './types'
import { Api } from './Api'
// @ts-ignore
import { TRegistryData } from '~/utils/interfaces'

// const createCancelTokenSource = () => axios.CancelToken.source()

class Singleton extends Api {
  private static instance: Singleton
  commonCancelTokenSource: CancelTokenSource
  // axiosInstance: AxiosInstance

  private constructor() {
    super()
    this.commonCancelTokenSource = axios.CancelToken.source()
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()

    return Singleton.instance
  }

  async checkJWT(): Promise<
    | {
        ok: boolean
        message?: string
        code: EAPIUserCode
        regData?: TRegistryData
      }
    | string
  > {
    this.commonCancelTokenSource.cancel('axios request canceled')
    this.commonCancelTokenSource = axios.CancelToken.source()

    const data = await this.api({
      url: '/auth/check-jwt',
      data: {},
      cancelToken: this.commonCancelTokenSource.token
    })
      .then((r) => r)
      .catch((msg) => msg)
    
    this.commonCancelTokenSource.cancel('axios request done')

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }

  async login(body: {
    username: string,
    password: string,
    room: string
  }): Promise<
    | {
        ok: boolean
        message?: string
        code: EAPIUserCode
        regData?: TRegistryData
      }
    | string
  > {
    this.commonCancelTokenSource.cancel('axios request canceled')
    this.commonCancelTokenSource = axios.CancelToken.source()

    const data = await this.api({
      url: '/auth/login',
      data: body,
      cancelToken: this.commonCancelTokenSource.token
    })
      .then((r) => r)
      .catch((msg) => msg)
    
    this.commonCancelTokenSource.cancel('axios request done')

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }
}

export const jwtHttpClient = Singleton.getInstance()
