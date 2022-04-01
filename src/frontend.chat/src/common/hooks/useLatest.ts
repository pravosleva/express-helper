import { useRef, useLayoutEffect } from 'react'

export const useLatest = (value: string) => {
  const valueRef = useRef<string>(value)

  useLayoutEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef
}
