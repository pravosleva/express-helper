import { useRef, useLayoutEffect } from 'react'

export const useLatest = (value: any) => {
  const valueRef = useRef<string>(value)

  useLayoutEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef
}
