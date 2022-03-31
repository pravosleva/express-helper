import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
// import { Logic } from '~/pages/chat/components/TasklistModal/Logic'

type TProps = {
  tasklist: any[]
}
type TResult = [{
  month1: number
  month2: number
  month3: number
  month6: number
}]

const PUBLIC_URL = process.env.PUBLIC_URL || '.'
const worker = new Worker(`${PUBLIC_URL}/web-worker/main.js`)
const initialMothSum = {
  month1: 0,
  month2: 0,
  month3: 0,
  month6: 0,
}


export const useTasklistInRange = ({ tasklist }: TProps): TResult => {
  // const [value, setValue] = useState<number>(0)
  // const logic = useMemo(() => new Logic(tasklist), [tasklist])
  const [sum, setSum] = useState<{[key: string]: number}>(initialMothSum)

  useEffect(() => {
    worker.onmessage = ($event) => {
      if (!!$event?.data) {
        // console.log($event.data)

        switch ($event.data.actionCode) {
          case 'getSumLastMonths':
            setSum($event.data.sum)
            break;
          default: break;
        }
      }
    }
  }, [])

  const updateValue = () => {
    // setValue((v) => v + 1)
    worker.postMessage({ action: 'getSumLastMonths', tasklist });
  }
  const timeout = useRef<any>()

  useEffect(() => {
    timeout.current = setTimeout(updateValue, 1000)

    return () => {
      if (!!timeout.current) clearTimeout(timeout.current)
    }
  }, [sum, updateValue])

  const rangeSum = useMemo(() => {
    // const nowDate = new Date()
    // const month1 = logic.getSumLastMonths({ months: 1, currDate: nowDate })
    // const month3 = logic.getSumLastMonths({ months: 3, currDate: nowDate })
    // const month6 = logic.getSumLastMonths({ months: 6, currDate: nowDate })
    const { month1, month2, month3, month6 } = sum

    return {
      month1,
      month2,
      month3,
      month6,
    }
  }, [sum])

  return [rangeSum]
}