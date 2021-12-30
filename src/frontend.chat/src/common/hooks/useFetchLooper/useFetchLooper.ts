import { useEffect, useState, useRef } from 'react'
import { usePollingWorker, TWorkerFnParams } from './utils/usePollingWorker'

export const useFetchLooper = ({
  timeout,
  validate,
  runnerAction,
  cb,
}: {
  timeout: number,
  runnerAction: {
    type: string
    payload: {
      url: string,
      method: 'POST' | 'GET',
      body: any,
    }
  },
  validate: {
    beforeRequest: (payload: any) => boolean,
  },
  cb: {
    onUpdateState: (hookResult: { state: any }) => void
  },
}) => {
  // --- POLLING: v2 
  const { state, run } = usePollingWorker({
    // - NOTE: Callback source code for Blob
    fn: ({ url, method, body }: TWorkerFnParams) => {
      fetch(url, { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
        .then((res) => res.json())
        .then((json) => {
          // @ts-ignore
          postMessage(json)
        })
        .catch(console.log)
    }
    // -
  })

  // -- LOOPER
  const [tick, setTick] = useState(0)
  const t = useRef<NodeJS.Timeout>()
  useEffect(() => {
    const req = () => {
      console.log(`- run worker in effect #${tick}`)
      if (validate.beforeRequest(runnerAction.payload)) {
        run({
          type: runnerAction.type,
          payload: runnerAction.payload,
        })
      }
      setTick((c) => c + 1)
    }
    t.current = setTimeout(req, timeout)
    return () => {
      if (!!t.current) clearTimeout(t.current)
    }
  }, [JSON.stringify(runnerAction.payload), tick])
  // --

  useEffect(() => {
    if (!!cb.onUpdateState) cb.onUpdateState({ state })
  }, [JSON.stringify(state)])

  return { state }
}
