import axios, { CancelTokenSource } from 'axios'
import { EAPIUserCode, TUserResData } from './types'
import { Api } from './Api'

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

  async checkJWT({ username }: { username: string }): Promise<TUserResData> {
    if (!username) return Promise.reject({ ok: false, message: 'Заполните имя пользователя' })

    this.commonCancelTokenSource.cancel('axios request canceled')
    this.commonCancelTokenSource = axios.CancelToken.source()

    const data = await this.api({
      url: '/auth/check-jwt',
      data: { username },
      cancelToken: this.commonCancelTokenSource.token
    })
      .then((r) => r)
      .catch((r) => r)
    
    this.commonCancelTokenSource.cancel('axios request done')

    return data.ok ? Promise.resolve(data) : Promise.reject(data)
  }

  async login(body: {
    username: string,
    password: string,
    room: string
  }): Promise<TUserResData> {
    this.commonCancelTokenSource.cancel('axios request canceled')
    this.commonCancelTokenSource = axios.CancelToken.source()

    const data = await this.api({
      url: '/auth/login',
      data: body,
      cancelToken: this.commonCancelTokenSource.token
    })
      .then((r) => r)
      .catch((r) => r)
    
    this.commonCancelTokenSource.cancel('axios request done')

    return data.ok ? Promise.resolve(data) : Promise.reject(data)
  }

  async logout(): Promise<TUserResData> {
    this.commonCancelTokenSource.cancel('axios request canceled')
    this.commonCancelTokenSource = axios.CancelToken.source()

    const data = await this.api({
      url: '/auth/logout',
      cancelToken: this.commonCancelTokenSource.token
    })
      .then((r) => r)
      .catch((r) => r)
    
    this.commonCancelTokenSource.cancel('axios request done')

    return data.ok ? Promise.resolve(data) : Promise.reject(data)
  }
}

export const jwtHttpClient = Singleton.getInstance()
