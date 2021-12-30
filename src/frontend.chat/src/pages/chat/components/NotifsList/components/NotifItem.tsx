import { useState, useMemo } from 'react'
import { Box, Button, Flex, Grid, Text, Tag, useToast, UseToastOptions } from "@chakra-ui/react"
import { getNormalizedDate } from '~/utils/timeConverter'
import { FaTrashAlt } from 'react-icons/fa'
import Countdown, { zeroPad } from 'react-countdown'
import { useSnapshot } from 'valtio'
import { useMainContext } from '~/mainContext'
import { ERegistryLevel } from '~/utils/interfaces'

const isDev = process.env.NODE_ENV === 'development'

type TProps = {
  onRemove: (ts: number) => void
  ts: number
  tsTarget: number
  text: string
  inProgress: boolean
  onComplete?: ({ ts, text }: { ts: number, text: string }) => void
}

const CountdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) return <Tag colorScheme='red' ml={2}>Time is up!</Tag>
  const getColorByDays = (days: number) => days <= 2 ? 'red' : 'gray'
  const color = getColorByDays(days)

  return <Tag colorScheme={color} ml={2}>{!!days ? `${days} d ` : ''}{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</Tag>
}

export const NotifItem = ({ onRemove, ts, text, tsTarget, inProgress, onComplete }: TProps) => {
  const { userInfoProxy, sprintFeatureProxy } = useMainContext()
  const userInfoSnap = useSnapshot(userInfoProxy)
  const sprintFeatureSnap = useSnapshot(sprintFeatureProxy)
  const isLogged = useMemo<boolean>(() => userInfoSnap.regData.registryLevel === ERegistryLevel.TGUser, [userInfoSnap.regData.registryLevel])
  // const isFirstRender = useRef<boolean>(true)
  // useEffect(() => {
  //   if (isFirstRender.current) console.log(`GET ${ts}`)
  //   isFirstRender.current = false
  // }, [])
  const firstString = text.split('\n')[0]
  const isClosable: boolean = text.split('\n').length > 1
  const [isOpened, setIsOpened] = useState<boolean>(!isClosable)
  const toggle = () => {
    setIsOpened((s) => !s)
  }

  const toast = useToast()
  const handleScrollIntoView = (ts: number) => {
    try {
      const targetElm = document.getElementById(String(ts)) // reference to scroll target
        
      if (!!targetElm) {
        targetElm.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' })
        if (isDev) toast({
          position: 'bottom',
          title: 'In viewport',
          status: 'success',
          duration: 3000,
        })
      } else {
        toast({
          position: 'bottom',
          title: 'Элемент не подгружен',
          description: 'Надо бы сделать догрузку списка',
          status: 'warning',
          duration: 3000,
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
  

  return (
    <>
      <Grid templateColumns='auto 50px' gap={2}>
        <Flex alignItems='center'>
          {getNormalizedDate(tsTarget)}
          <Countdown
            date={tsTarget}
            renderer={CountdownRenderer}
            onComplete={!!onComplete ? () => onComplete({ ts, text }) : undefined}
          />
        </Flex>
        {
          isLogged && (
            <Button
              size='sm'
              isLoading={inProgress}
              isDisabled={inProgress || !sprintFeatureSnap.isPollingWorks}
              onClick={() => {
                const isConfirmed = window.confirm('Вы точно хотите удалить это из спринта?')
                if (isConfirmed) onRemove(ts)
              }}
              colorScheme='gray'
              variant='outline'
            ><FaTrashAlt size={13} /></Button>
          )
        }
      </Grid>
      <Box
        style={{
          // border: '1px solid red'
          borderLeft: '4px solid var(--chakra-colors-gray-200)',
          paddingLeft: 'var(--chakra-space-3)',
          whiteSpace: 'pre-wrap',
        }}
        onClick={() => { handleScrollIntoView(ts) }}
        className='notif-box'
      >
        {
          !isClosable
          ? <b>{text}</b>
          : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div>{isOpened ? <b>{text}</b> : <b>{firstString}</b>}</div>
              <div>
                <Button
                  mt={2}
                  size='xs'
                  // isFullWidth
                  isLoading={inProgress}
                  onClick={toggle}
                  colorScheme='gray'
                  variant='link'
                >{isOpened ? 'Close' : 'Open'}</Button>
              </div>
            </div>
          )
        }
      </Box>
    </>
  )
}