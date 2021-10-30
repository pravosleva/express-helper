import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { getCurrentPercentage } from '~/utils/getCurrentPercentage'
import { DateDiff } from '~/utils/DateDiff'

// const PUBLIC_URL = process.env.PUBLIC_URL || '.'
// const worker = new Worker(`${PUBLIC_URL}/web-worker/main.js`)

type TProps = {
  targetDateTs: number
  startDateTs: number
}
type TResult = [number, {
  inSeconds: number
  inMinutes: number
  inHours: number
  inDays: number
  inWeeks: number
  inMonths: number
  inYears: number
}]

export const useDiffTime = ({ targetDateTs, startDateTs }: TProps): TResult => {
  const [value, setValue] = useState<number>(
    getCurrentPercentage({ targetDateTs, startDateTs }),
    // 0
  )

  // useEffect(() => {
  //   worker.onmessage = ($event) => {
  //     if (!!$event?.data) {
  //       switch ($event.data.actionCode) {
  //         case 'getCurrentPercentage':
  //           setValue($event.data.currentPercentage)
  //           break;
  //         default: break;
  //       }
  //     }
  //   }
  // }, [])

  const timeout = useRef<any>()
  const updateValue = useCallback(() => {
    const newVal = getCurrentPercentage({ targetDateTs, startDateTs })
    setTimeout(() => {
      setValue(newVal)
    }, 0)
    // worker.postMessage({ action: 'getCurrentPercentage', targetDateTs, startDateTs  });
  }, [targetDateTs, startDateTs])

  useEffect(() => {
    timeout.current = setTimeout(updateValue, 1000)

    return () => {
      if (!!timeout.current) clearTimeout(timeout.current)
    }
  }, [targetDateTs, startDateTs, value])

  const diffsToNow = useMemo(() => {
    const nowDate = new Date()
    const targetDate = new Date(targetDateTs + (targetDateTs - startDateTs))

    return {
      inSeconds: DateDiff.inSeconds(nowDate, targetDate),
      inMinutes: DateDiff.inMinutes(nowDate, targetDate),
      inHours: DateDiff.inHours(nowDate, targetDate),
      inDays: DateDiff.inDays(nowDate, targetDate),
      inWeeks: DateDiff.inWeeks(nowDate, targetDate),
      inMonths: DateDiff.inMonths(nowDate, targetDate),
      inYears: DateDiff.inYears(nowDate, targetDate)
    }
  }, [value])

  return [value, diffsToNow]
}