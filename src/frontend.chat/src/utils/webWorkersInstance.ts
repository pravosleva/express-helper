const PUBLIC_URL = process.env.PUBLIC_URL || ''

class Singleton {
  private static instance: Singleton
  filtersWorker: any;
  additionalWorker: any;

  private constructor() {
    this.filtersWorker = new Worker(`${PUBLIC_URL}/web-worker/messagesLogic/index.js`)
    this.additionalWorker = new Worker(`${PUBLIC_URL}/web-worker/messagesLogic/index.js`)
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()

    return Singleton.instance
  }
}

export const webWorkersInstance = Singleton.getInstance()
