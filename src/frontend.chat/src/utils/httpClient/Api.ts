import axios, { AxiosInstance, AxiosResponse, CancelToken } from 'axios'
// import axiosRetry from 'axios-retry'
import * as rax from 'retry-axios'

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || ''

export class Api {
  axiosInstance: AxiosInstance

  constructor() {
    const axiosInstance = this.axiosInstance = axios.create({
      baseURL: REACT_APP_API_URL,
      // timeout: 1000,
      // headers: { 'X-Custom-Header': 'foobar' },
    })
    // v1:
    // axiosRetry(this.axiosInstance, { retries: 5, retryDelay: axiosRetry.exponentialDelay })

    // v2:
    axiosInstance.defaults.raxConfig = {
      instance: axiosInstance,
      // You can set the backoff type.
      // options are 'exponential' (default), 'static' or 'linear'
      backoffType: 'exponential',
      // Retry 5 times on requests that return a response (500, etc) before giving up. Defaults to 3.
      retry: 5,
      // Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
      noResponseRetries: 5,
      httpMethodsToRetry: ['GET', 'OPTIONS', 'POST'],
      // You can detect when a retry is happening, and figure out how many
      // retry attempts have been made
      onRetryAttempt: err => {
        const cfg: any = rax.getConfig(err)
        console.log(`Retry attempt #${cfg.currentRetryAttempt}`)
      },
    };
    const _interceptorId = rax.attach(axiosInstance);
    console.log(_interceptorId)

    this.api = this.api.bind(this)
  }

  universalAxiosResponseHandler(validator: (data: any) => boolean) {
    return (axiosRes: AxiosResponse) => {
      try {
        if (!validator(axiosRes)) {
          console.log('- case 1: axiosRes')
          console.log(axiosRes)
          return { isOk: false, res: axiosRes.data }
        }
        console.log('- case 2: axiosRes')
        console.log(axiosRes)
        return { isOk: true, res: axiosRes.data }
      } catch (err: any) {
        console.log('- case 3: axiosRes')
        console.log(axiosRes)
        return { isOk: false, res: axiosRes?.data || err, message: err.message || 'No err.message' }
      }
    }
  }

  // getErrorMsg(data: any) {
  //   return data?.message ? data?.message : 'Извините, что-то пошло не так'
  // }

  async api({ url, data, cancelToken }: { url: string; data?: any, cancelToken: CancelToken }): Promise<any> {
    const axioOpts: any = {
      method: 'POST',
      url: `/chat/api${url}`,
      // mode: 'cors',
      cancelToken,
    }
    if (!!data) axioOpts.data = data

    const result = await this.axiosInstance(axioOpts)
      // .then((res: any) => res)
      .then(
        this.universalAxiosResponseHandler(({ data }) => {
          // console.log(data)
          return data?.ok === true || data?.ok === false // NOTE: API like smartprice
        })
      )
      .catch((err: any) => {
        if (axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          console.dir({
            REACT_APP_API_URL,
            err,
            url,
          })
        }
        return { isOk: false, message: err.message || 'No err.message', res: err }
      })

    // console.log(result) // { isOk: true, res: { ok: true, _originalBody: { username: 'pravosleva', chatId: 432590698 } } }

    return result.isOk ? Promise.resolve(result.res) : Promise.reject(result.res)
  }
}
