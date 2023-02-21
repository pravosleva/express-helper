import { useState, useCallback, useMemo, useEffect } from 'react'
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
import { useMainContext } from '~/context/mainContext'
import { useSnapshot } from 'valtio'
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

export const ServerInfo = () => {
  const { cpuFeatureProxy } = useMainContext()
  const cpuFeatureSnap = useSnapshot(cpuFeatureProxy)

  // const usedPercentage = useMemo(() => !!cpuFeatureSnap?.mem ? Number((cpuFeatureSnap.mem.available * 100 / cpuFeatureSnap.mem.used).toFixed(0)) : 0, [cpuFeatureSnap.mem?.used, cpuFeatureSnap.mem?.available])
  const available = useMemo(() => (cpuFeatureSnap.mem?.available || 0) / 1024 / 1024, [cpuFeatureSnap.mem?.available])
  const used = useMemo(() => (cpuFeatureSnap.mem?.used || 0) / 1024 / 1024, [cpuFeatureSnap.mem?.used])
  const free = useMemo(() => (cpuFeatureSnap.mem?.free || 0) / 1024 / 1024, [cpuFeatureSnap.mem?.free])
  const total = useMemo(() => (cpuFeatureSnap.mem?.total || 0) / 1024 / 1024, [cpuFeatureSnap.mem?.total])
  const active = useMemo(() => (cpuFeatureSnap.mem?.active || 0) / 1024 / 1024, [cpuFeatureSnap.mem?.active])
  const availableOfActive = useMemo(() => getPercentage({ x: available, sum: active }), [available, active])
  const activeOfUsed = useMemo(() => getPercentage({ x: active, sum: used }), [used, active])
  
  return (
    <div>
      {/* <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(cpuFeatureSnap, null, 2)}</pre> */}
      {!!cpuFeatureSnap?.mem && (
        <Grid templateColumns='1fr 1fr' gap={2}>
          <Flex direction='column' justifyContent='center' alignItems='center'>
            <Flex justifyContent='center' alignItems='center'>
              <CircularProgress value={availableOfActive} color='green.400'>
                <CircularProgressLabel>{availableOfActive.toFixed(0)}%</CircularProgressLabel>
              </CircularProgress>
            </Flex>
            <div>Avail. {available.toFixed(0)} MB</div>
            <div>Active {active.toFixed(0)} MB</div>
          </Flex>

          {/* <Flex direction='column' justifyContent='flex-end'>
            <div></div>
            <div>Free {free.toFixed(0)} MB</div>
            <div>Total {total.toFixed(0)} MB</div>
            <div>Active {active.toFixed(0)} MB</div>
          </Flex> */}

          <Flex direction='column' justifyContent='center' alignItems='center'>
            <Flex justifyContent='center' alignItems='center'>
              <CircularProgress value={activeOfUsed} color='green.400'>
                <CircularProgressLabel>{activeOfUsed.toFixed(0)}%</CircularProgressLabel>
              </CircularProgress>
            </Flex>
            <div>Active {active.toFixed(0)} MB</div>
            <div>Used {used.toFixed(0)} MB</div>
          </Flex>

        </Grid>
      )}
    </div>
  )
}

/* NOTE: Sample
"mem": {
  "total": 536870912, // 512
  "free": 0,
  "used": 536870912, // 512
  "active": 476815360, // 454
  "available": 60055552, // 57
  "buffers": 0,
  "cached": 31002624, // 29
  "slab": 29052928, // 27.7
  "buffcache": 60055552, // 57
  "swaptotal": 0,
  "swapused": 0,
  "swapfree": 0
},
*/
