import {
  TConnectionData,
  TUserName,
} from './types'

class Singleton {
  private static instance: Singleton;
   state: Map<TUserName, TConnectionData>;

  private constructor() {
    this.state = new Map()
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();

    return Singleton.instance;
  }

  public keys() {
    return this.state.keys()
  }
  public set(key: string, value: TConnectionData) {
    this.state.set(key, value)
  }
  public get(key: string) {
    return this.state.get(key)
  }
  public delete(key: string) {
    return this.state.delete(key)
  }
  public has(key: string) {
    return this.state.has(key)
  }
}

export const usersMapInstance = Singleton.getInstance()
