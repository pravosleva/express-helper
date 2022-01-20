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

export const ServerInfo = () => {
  const { cpuFeatureProxy } = useMainContext()
  const cpuFeatureSnap = useSnapshot(cpuFeatureProxy)

  const usedPercentage = useMemo(() => !!cpuFeatureSnap?.mem ? Number((cpuFeatureSnap.mem.available * 100 / cpuFeatureSnap.mem.used).toFixed(0)) : 0, [cpuFeatureSnap.mem?.used, cpuFeatureSnap.mem?.available])

  return (
    <div>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(cpuFeatureSnap, null, 2)}</pre>
      {!!cpuFeatureSnap && (
        <>
          {!!cpuFeatureSnap.mem && (
            <Grid templateColumns='1fr 2fr' gap={2}>
              <Flex direction='column' justifyContent='center' alignItems='center'>
                <Flex justifyContent='center' alignItems='center'>
                  <CircularProgress value={usedPercentage} color='green.400'>
                    <CircularProgressLabel>{usedPercentage.toFixed(0)}%</CircularProgressLabel>
                  </CircularProgress>
                </Flex>
                <div>Avail. {(cpuFeatureSnap.mem.available / 1024 / 1024).toFixed(0)} MB</div>
                <div>Used {(cpuFeatureSnap.mem.used / 1024 / 1024).toFixed(0)} MB</div>
              </Flex>

              <Flex direction='column' justifyContent='flex-end'>
                <div></div>
                <div>Free {(cpuFeatureSnap.mem.free / 1024 / 1024).toFixed(0)} MB</div>
                <div>Total {(cpuFeatureSnap.mem.total / 1024 / 1024).toFixed(0)} MB</div>
                <div>Active {(cpuFeatureSnap.mem.active / 1024 / 1024).toFixed(0)} MB</div>
              </Flex>

            </Grid>
          )}
        </>
      )}
    </div>
  )
}
