import QRCode from 'qrcode'
import { promisify } from 'es6-promisify'

const genDataUrl: (payload: string) => Promise<string> = promisify(QRCode.toDataURL.bind(QRCode))

type TSessionData = { reqId: string, payload: string, hash: string, infoUrl: string, success_url: string, fail_url: string }

// NOTE: Несколько других устройств для аутентификации по QR коду:
// TODO: Could be moved to envs
const authOnOtherDevicesLimit = 1

class Singleton {
  private static instance: Singleton;
   state: Map<string, { qr: string, hash: string, additionalLoggedCounter: number, infoUrl: string, success_url: string, fail_url: string }>;

  private constructor() {
    this.state = new Map()
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();

    return Singleton.instance;
  }

  public async createQR(payload: string) {
    const dataUrl = await genDataUrl(payload)

    return dataUrl
  }
  public async addExistsSession({
    reqId,
    infoUrl: payload,
    infoUrl,
    hash,
    success_url,
    fail_url,
  }: TSessionData): Promise<string> {
    const qr = await this.createQR(payload)

    this.state.set(reqId, {
      hash,
      qr,
      additionalLoggedCounter: 0, // Login on first device.
      success_url,
      fail_url,
      infoUrl,
    })

    return qr
  }
  public addLoggedSessionOrDelete(reqId: string): Promise<string> {
    if (this.state.has(reqId)) {
      const sesData = this.state.get(reqId)
      const currentCounter = sesData.additionalLoggedCounter
      
      if (currentCounter + 1 >= authOnOtherDevicesLimit) {
        this.state.delete(reqId)
        return Promise.resolve('Вы аутентифицированы последний раз на доп устройстве в рамках конкретной сессии')
      } else {
        const newLoggedCounter = currentCounter + 1

        this.state.set(reqId, {
          ...sesData,
          additionalLoggedCounter: newLoggedCounter,
        })
        return Promise.resolve(`Вы аутентифицированы на доп устройстве ${newLoggedCounter} раз`)
      }
    } else {
      return Promise.reject('Извините, такой сессии нет в памяти. Попробуйте авторизоваться еще раз.')
    }
  }
  public clearState(): void {
    this.state.clear()
  }
}

export const addsDevicesLoggedState = Singleton.getInstance()
