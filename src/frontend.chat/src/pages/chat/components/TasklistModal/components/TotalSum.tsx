import { useState, useCallback, useRef, useEffect, useContext } from 'react'
import {
  Text,
  Stack,
  Tag,
} from '@chakra-ui/react'
import { getPrettyPrice } from '~/utils/getPrettyPrice'
import { UsersContext } from '~/context/usersContext'
import { TiArrowLoop } from 'react-icons/ti'
// <TiArrowLoop size={19} />

const PUBLIC_URL = process.env.PUBLIC_URL || '.'
const worker: any = new Worker(`${PUBLIC_URL}/web-worker/main.js`)

export const TotalSum = () => {
  const { tasklist } = useContext(UsersContext)
  const initialMothSum = {
    month1: 0,
    month2: 0,
    month3: 0,
    month6: 0,
    'month0.5': 0,
  }
  const [sum, setSum] = useState<{[key: string]: number}>(initialMothSum)
  // Новый хук Реакт 18 useTransition
  // const [startTransition, _isPending] = useTransition({
  //   timeoutMs: 500 // Время, отведенное на переход
  // });
  useEffect(() => {
    worker.onmessage = ($event: any) => {
      const { data } = $event

      if (!!data) {
        switch (data.actionCode) {
          case 'getSumLastMonths':
            // startTransition(() => { setSum($event.data.sum) })
            setSum($event.data.sum)
            break;
          default: break;
        }
      }
    }
  }, [])
  const updateSum = useCallback(() => {
    worker.postMessage({ action: 'getSumLastMonths', tasklist });
  }, [tasklist])
  const timeout = useRef<any>()

  useEffect(() => {
    timeout.current = setTimeout(updateSum, 1000)

    return () => {
      if (!!timeout.current) clearTimeout(timeout.current)
    }
  }, [sum])

  return (
    <Stack marginRight='auto'>
      {!!sum['month0.5'] && (
        // <Text fontSize="sm" fontWeight='bold'>2w ={getPrettyPrice(sum['month0.5'])}</Text>
        <Text fontSize="sm" fontWeight='bold' display='flex'><span><TiArrowLoop size={19} /></span>&nbsp;✅&nbsp;<Tag colorScheme='green'>Ready</Tag>&nbsp;&&nbsp;<span><TiArrowLoop size={19} /></span>&nbsp;🔲 ={getPrettyPrice(sum['month0.5'])}</Text>
      )}
      {!!sum.month3 && (
        <Text fontSize="sm" fontWeight='bold'>3m ={getPrettyPrice(sum.month3)}</Text>
      )}
      {/*!!sum.month6 && (
        <Text fontSize="sm" fontWeight='bold'>6m ={getPrettyPrice(sum.month6)}</Text>
      )*/}
    </Stack>
  )
}