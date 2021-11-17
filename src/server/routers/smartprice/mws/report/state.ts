export type TSPUID = string

class Singleton {
  private static instance: Singleton;
   state: Map<TSPUID, any>;

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
  public set(key: string, value: any) {
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
  public get size() {
    return this.state.size
  }
  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[key] = value
    })

    return state
  }
  public getStateTSRange({ from, to }: { from: number, to: number }) {
    const state = {}

    for (const [key, value] of this.state) {
      if (!!from && !!value.ts) {
        if (!!from && !!to) {
          if (value.ts >= from && value.ts <= to) state[key] = value
        } else {
          if (value.ts <= to) state[key] = value
        }
      } else {
        state[key] = value
      }
    }

    return state
  }
}

export const reportMapInstance = Singleton.getInstance()
