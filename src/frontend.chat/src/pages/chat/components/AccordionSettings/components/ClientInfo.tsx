import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  Button,
  Stack,
  Flex,
  Text,

  Grid,
  Spinner,
  FormControl,
  Switch,
  FormLabel,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react'
import { linear } from 'math-interpolate'

const getPercentage = ({ x, sum }: { x: number, sum: number }) => {
  const result = linear({
    x1: 0,
    y1: 0,
    x2: sum,
    y2: 100,
    x: x,
  })

  return result
}

export const ClientInfo = memo(() => {
  const [state, setMemState] = useState<any>(null)
  const [counter, setCounter] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // @ts-ignore
    if (!window.performance?.memory) return

    intervalRef.current = setInterval(() => {
      setCounter((s) => s + 1)
    }, 1000)

    return () => {
      if (!!intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    // @ts-ignore
    // if (!window.performance?.memory) return
  
    const state = window.performance?.memory
    const isCorrect = !!state.jsHeapSizeLimit && !!state.totalJSHeapSize && !!state.usedJSHeapSize

    if (isCorrect) setMemState({
      jsHeapSizeLimit: state.jsHeapSizeLimit,
      totalJSHeapSize: state.totalJSHeapSize,
      usedJSHeapSize: state.usedJSHeapSize
    })
  }, [counter])

  const limit = useMemo(() => (state?.jsHeapSizeLimit || 0) / 1024 / 1024, [state?.jsHeapSizeLimit])
  const total = useMemo(() => (state?.totalJSHeapSize || 0) / 1024 / 1024, [state?.totalJSHeapSize])
  const used = useMemo(() => (state?.usedJSHeapSize || 0) / 1024 / 1024, [state?.usedJSHeapSize])
  const totalOfLimit = useMemo(() => getPercentage({ x: total, sum: limit }), [total, limit])
  const usedOfTotal = useMemo(() => getPercentage({ x: used, sum: total }), [used, total])

  if (!state) return null

  return (
    <div>
      {/* <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(state, null, 2)}</pre> */}
      {!!state && (
        <Grid templateColumns='1fr 1fr' gap={2}>
          <Flex direction='column' justifyContent='center' alignItems='center'>
            <Flex justifyContent='center' alignItems='center'>
              <CircularProgress value={usedOfTotal} color='green.400'>
                <CircularProgressLabel>{usedOfTotal.toFixed(0)}%</CircularProgressLabel>
              </CircularProgress>
            </Flex>
            <div>Used {used.toFixed(0)} MB</div>
            <div>Total {total.toFixed(0)} MB</div>
          </Flex>

          <Flex direction='column' justifyContent='center' alignItems='center'>
            <Flex justifyContent='center' alignItems='center'>
              <CircularProgress value={totalOfLimit} color='green.400'>
                <CircularProgressLabel>{totalOfLimit.toFixed(0)}%</CircularProgressLabel>
              </CircularProgress>
            </Flex>
            <div>Total {total.toFixed(0)} MB</div>
            <div>Limit {limit.toFixed(0)} MB</div>
          </Flex>

        </Grid>
      )}
    </div>
  )
})
