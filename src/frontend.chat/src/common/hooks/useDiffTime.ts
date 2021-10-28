import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { getCurrentPercentage } from '~/utils/getCurrentPercentage'
import { DateDiff } from '~/utils/DateDiff'

type TProps = {
  targetDateTs: number
  startDateTs: number
}
type TResult = [number, {
  inDays: number
  inWeeks: number
  inMonths: number
  inYears: number
}]

export const useDiffTime = ({ targetDateTs, startDateTs }: TProps): TResult => {
  const [value, setValue] = useState(
    getCurrentPercentage({
      targetDateTs,
      startDateTs,
    }),
  )
  const timeout = useRef<any>()
  const updateValue = useCallback(() => {
    const newVal = getCurrentPercentage({
      targetDateTs,
      startDateTs,
    })
    setValue(newVal)
  }, [targetDateTs, startDateTs])

  useEffect(() => {
    timeout.current = setTimeout(updateValue, 1000)

    return () => {
      if (!!timeout.current) clearTimeout(timeout.current)
    }
  }, [targetDateTs, startDateTs, value])

  const diffsToNow = useMemo(() => {
    const nowDate = new Date()
    const targetDate = new Date(targetDateTs)

    return {
      inDays: DateDiff.inDays(nowDate, targetDate),
      inWeeks: DateDiff.inWeeks(nowDate, targetDate),
      inMonths: DateDiff.inMonths(nowDate, targetDate),
      inYears: DateDiff.inYears(nowDate, targetDate)
    }
  }, [value])

  return [value, diffsToNow]
}