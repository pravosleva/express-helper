export enum EStatus {
  STARTED = 'started',
  STOPPED = 'stopped',
}
export type TMakeLooperInstance = {
  start: (cb: () => void) => void;
  stop: () => void;
  getState: () => EStatus;
}

export const MakeLooper = (ms: number = 3000): () => TMakeLooperInstance => {
  let timer: NodeJS.Timeout
  let status = EStatus.STOPPED

  return () => {
    const start = (cb: () => void) => {
      if (status !== EStatus.STARTED) {
        // console.log("Run");
      status = EStatus.STARTED
      timer = setTimeout(function () {
        // console.log("Looper done and will be restarted.");
        if (cb) cb()

        start(cb)
      }, ms)
      } else console.log('Looper statred already')
    }
    const stop = () => {
      // console.log("Looper stopped");
      // wasStopped = true;
      status = EStatus.STOPPED
      if (!!timer) clearTimeout(timer)
    }
    const getState = (): EStatus => {
      return status
    }
    return { start, stop, getState }
  }
}
