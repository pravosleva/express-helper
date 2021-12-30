import { useRef, useState } from 'react'

const workerHandler = (fn: (arg: any) => void) => {
  onmessage = (nativeWorkerEvt: any) => {
    console.log(nativeWorkerEvt.data)
    fn(nativeWorkerEvt.data)
  }
}

export const usePollingWorker = ({ fn }: { fn: (arg: any) => void }) => {
  const [state, setState] = useState<any>(null)
  const workerRef = useRef<Worker | null>(null)

  const run = (arg: { type: string, payload: any }) => {
    try {
      const worker = new Worker(
        URL.createObjectURL(new Blob([`(${workerHandler.toString()})(${fn.toString()})`], { type: 'text/javascript' }))
      )
      workerRef.current = worker
      workerRef.current.onmessage = (e) => {
        setState(e.data) // payload
        if (!!workerRef.current) {
          workerRef.current.terminate()
          workerRef.current = null
        }
      }
      if (!!workerRef.current) workerRef.current.postMessage(arg.payload)
    } catch (err) {
      console.log(err)
    }
  }

  return {
    state,
    run,
  }
}
