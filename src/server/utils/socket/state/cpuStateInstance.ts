import si, { Systeminformation } from 'systeminformation'
import { MakeLooper } from '~/utils/MakeLooper'

type TData = Systeminformation.MemData
type TMapFormat = Map<string, (TData | Systeminformation.DiskLayoutData[])>

class Singleton {
  private static instance: Singleton;
   state: TMapFormat;

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
  public get size() {
    return this.state.size
  }
  public set(key: string, value: TData | Systeminformation.DiskLayoutData[]) {
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

  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[String(key)] = value
    })

    return state
  }
}

export const cpuStateInstance = Singleton.getInstance()

const siMemLooper = MakeLooper(10000)();
siMemLooper.start(() => {
  si.mem()
    .then((data) => {
      cpuStateInstance.set('mem', data)
    })
  si.diskLayout()
    .then((data) => {
      cpuStateInstance.set('diskLayout', data)
    })
})
