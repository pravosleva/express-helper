import { getTimeAgo } from '~/utils/getTimeAgo'

type TValue = { ts: number, descr: string, _serviceMsg?: string }

class Singleton {
  private static instance: Singleton;
  state: Map<string, TValue>;
  locked: string | null;

  private constructor() {
    this.state = new Map()
    this.locked = null
  }

  public keys() {
    return this.state.keys()
  }
  public set(key: string, value: TValue) {
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

  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();

    return Singleton.instance;
  }

  public setData({ backupName }: { backupName: string }) {
    const ts = Date.now()
  
    this.state.set(backupName, { ts, descr: new Date(ts).toISOString() })
  }
  public lock(backupName: string) {
    if (this.state.has(backupName)) {
      this.locked = backupName
    }

    return this.locked
  }
  public lockLatest() {
    let _targetLatestTime = new Date(1995, 11, 17).getTime();
    const state = this.getState()
    let latestBackupName = null
  
    for (const backupName in state) {
      if (state[backupName].ts >= _targetLatestTime) {
        _targetLatestTime = state[backupName].ts
        latestBackupName = backupName
      }
    }

    if (!!latestBackupName) this.lock(latestBackupName)

    return latestBackupName
  }
  public getLocked(): string | null {
    return this.locked
  }
  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      value._serviceMsg = getTimeAgo(value.ts)
      state[key] = value
    })

    return state
  }
}

export const cronStateInstance = Singleton.getInstance()
