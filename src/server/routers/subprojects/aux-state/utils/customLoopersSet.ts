import { EStatus, MakeLooper, TMakeLooperInstance } from '~/utils/MakeLooper'

export enum ENamespace {
  AUDIT_LIST = 'audit-list',
  // NOTE: Etc. 1/6
}

class Singleton {
  private static instance: Singleton;
  auditListAuxStateLooper: TMakeLooperInstance;
  // NOTE: Etc. 2/6

  private constructor({ ms }: { ms: number }) {
    this.auditListAuxStateLooper = MakeLooper(ms)()
    // NOTE: Etc. 3/6
  }

  public static getInstance({ ms }: { ms: number }): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton({ ms })

    return Singleton.instance;
  }

  public start({ namespace, cb }: {
    namespace: ENamespace;
    cb: () => void;
  }) {
    switch (namespace) {
      case ENamespace.AUDIT_LIST:
        return this.auditListAuxStateLooper.start(cb)
      // NOTE: Etc. 4/6
      default:
        throw new Error(`Looper ${namespace} not found (4/6)`)
    }
  }
  public stop({ namespace }: {
    namespace: ENamespace;
  }) {
    switch (namespace) {
      case ENamespace.AUDIT_LIST:
        return this.auditListAuxStateLooper.stop()
      // NOTE: Etc. 5/6
      default:
        throw new Error(`Looper ${namespace} not found (5/6)`)
    }
  }

  public getState({ namespace }: {
    namespace: ENamespace;
  }): EStatus | string {
    switch (namespace) {
      case ENamespace.AUDIT_LIST:
        return this.auditListAuxStateLooper.getState()
      // NOTE: Etc. 6/6
      default:
        return `Looper ${namespace} not found (6/6)`
    }
  }
}

export const customLoopersSet = Singleton.getInstance({ ms: 10 * 1000 })
export type TCustomLoopersSet = typeof customLoopersSet
