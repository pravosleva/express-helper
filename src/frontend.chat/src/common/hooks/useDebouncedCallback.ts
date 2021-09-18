import { useEffect, useRef } from 'react'

type TProps = {
  callback: (args: any) => void
  wait?: number
  dontUseForFirstRender?: boolean
}

export function useDebouncedCallback({ callback, wait = 0, dontUseForFirstRender = false }: TProps) {
  // track args & timeout handle between calls
  const argsRef = useRef<any>([])
  const timeout = useRef<any>()
  const counter = useRef(0)

  function cleanup() {
    if (!!timeout.current) {
      clearTimeout(timeout.current)
    }
  }

  // make sure our timeout gets cleared if
  // our consuming component gets unmounted
  useEffect(() => cleanup, [])

  return [
    function debouncedCallback(...args: any) {
      // Not for first render; if unnecessary
      counter.current += 1
      if (dontUseForFirstRender && counter.current === 1) return

      // capture latest args
      argsRef.current = args

      // clear debounce timer
      cleanup()

      // start waiting again
      timeout.current = setTimeout(() => {
        if (argsRef.current) {
          // @ts-ignore
          callback(...argsRef.current)
        }
      }, wait)
    },
    cleanup,
  ]
}

/* USAGE SAMPLE:

const [handleDelayThenClose] = useDebouncedCallback({
  callback: onClose,
  wait: 1500,
});
*/
