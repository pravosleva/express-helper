export type TSPUID = string

class Singleton {
  private static instance: Singleton;
  state: Map<TSPUID, any[]>;
  public startTs: number;

  private constructor() {
    this.state = new Map()
    this.startTs = Date.now()
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();

    return Singleton.instance;
  }

  public keys() {
    return this.state.keys()
  }
  // public set(key: string, value: any) {
  //   this.state.set(key, value)
  // }
  public add(key: string, value: any) {
    if (!this.state.has(key)) {
      this.state.set(key, [value])
    } else {
      const oldState = this.state.get(key)

      if (Array.isArray(oldState)) {
        this.state.set(key, [...oldState, value])
      } else {
        this.state.set(key, [value])
      }
    }
  }
  public get(key: string) {
    return this.state.get(key)
  }
  public set(key: string, value: any) {
    return this.state.set(key, value)
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
    const count = {
      eventsFound: 0,
      totalClients: this.size,
    }
    
    this.state.forEach((value, key) => {
      state[key] = value
      if (Array.isArray(value) && value.length > 0) count.eventsFound += value.length
    })

    return { state, count }
  }
  public getStateTSRange({ from, to }: { from?: number, to?: number }) {
    const state = {}
    const count = {
      eventsFound: 0,
      totalClients: this.size,
      clientsFound: 0,
    }

    for (const [key, arr] of this.state) {
      if (Array.isArray(arr)) {
        arr.forEach((report) => {
          if (!!from && !!report.ts) {
            if (!!from && !!to) {
              if (report.ts >= from && report.ts <= to) {
                if (!state[key]) {
                  state[key] = []
                  count.clientsFound += 1
                }

                state[key].push(report)
                count.eventsFound += 1
              }
            } else {
              if (report.ts <= to) {
                if (!state[key]) {
                  state[key] = []
                  count.clientsFound += 1
                }

                state[key].push(report)
                count.eventsFound += 1
              }
            }
          } else {
            if (!state[key]) {
              state[key] = []
              count.clientsFound += 1
            }

            state[key].push(report)
            count.eventsFound += 1
          }
        })
      }
    }

    return { state, count }
  }
}

export const reportMapInstance = Singleton.getInstance()
