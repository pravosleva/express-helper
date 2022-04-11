import React, { useEffect, useRef } from 'react'
import equal from 'fast-deep-equal'

function usePrevious<T> (value: T) {
  const valueRef = useRef<T | null>(null)
  useEffect(() => {
    valueRef.current = value
  }, [value])
  return valueRef
}
export function useCustomCompare (deps: any[], isEqual: (a: any, b: any) => boolean) {
  const counterRef = useRef<number>(0)
  const pervDeps = usePrevious(deps)
  if (!isEqual(pervDeps.current, deps)) counterRef.current++
  return counterRef.current
}

export function useCompare(deps: any[]) {
  return useCustomCompare(deps, equal)
}

export function useDeepEffect(cb: React.EffectCallback, deps: any[]) {
  useEffect(cb, [useCustomCompare(deps, equal)])
}
