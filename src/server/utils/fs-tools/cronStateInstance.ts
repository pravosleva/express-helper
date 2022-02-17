type TValue = { ts: number, descr: string }

class Singleton {
  private static instance: Singleton;
   state: Map<string, TValue>;

  private constructor() {
    this.state = new Map()
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
  
    this.state.set(backupName, { ts, descr: new Date(ts).toDateString() })
  }
  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[key] = value
    })

    return state
  }
}

export const cronStateInstance = Singleton.getInstance()
