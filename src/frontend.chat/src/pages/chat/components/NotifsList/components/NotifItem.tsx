import { useState, useMemo } from 'react'
import { Box, Button, Flex, Grid, Text, useToast, IconButton, Tooltip } from "@chakra-ui/react"
import { getNormalizedDate, getDayMonth } from '~/utils/timeConverter'
import { FaTrashAlt } from 'react-icons/fa'
import Countdown, { zeroPad } from 'react-countdown'
import { useSnapshot } from 'valtio'
import { useMainContext } from '~/context/mainContext'
import { ERegistryLevel, TMessage, EMessageStatus } from '~/utils/interfaces'
// import { AssignedBox } from '~/pages/chat/components/AssignedBox'
import { UserAva } from '~/pages/chat/components/UserAva'
import { IoMdClose } from 'react-icons/io'
import { ImFire } from 'react-icons/im'
import { FiActivity } from 'react-icons/fi'
import { FaCheck, FaInfoCircle } from 'react-icons/fa'
// import { BsFillInfoCircleFill } from 'react-icons/bs'
import { AiTwotoneEdit } from 'react-icons/ai'
import { CountdownRenderer } from './CountdownRenderer'
import { scrollIntoView } from '~/utils/scrollTo'
import styles from './NotifItem.module.scss'

// const isDev = process.env.NODE_ENV === 'development'

type TProps = {
  onRemove: (ts: number) => void
  ts: number
  tsTarget: number
  text: string
  inProgress: boolean
  onComplete?: ({ ts, text }: { ts: number, text: string }) => void
  original: TMessage
  onEdit?: (m: TMessage) => void
}

export const NotifItem = ({ onRemove, ts, text, tsTarget, inProgress, onComplete, original, onEdit }: TProps) => {
  const { userInfoProxy, sprintFeatureProxy, name } = useMainContext()
  const userInfoSnap = useSnapshot(userInfoProxy)
  // const sprintFeatureSnap = useSnapshot(sprintFeatureProxy)
  const isLogged = useMemo<boolean>(() => userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser, [userInfoSnap.regData?.registryLevel])
  // const isFirstRender = useRef<boolean>(true)
  // useEffect(() => {
  //   if (isFirstRender.current) console.log(`GET ${ts}`)
  //   isFirstRender.current = false
  // }, [])
  const firstString = !!text ? text.split('\n')[0] : 'ERR'
  const isClosable: boolean = !!text ? text.split('\n').length > 1 : false
  const [isOpened, setIsOpened] = useState<boolean>(!isClosable)
  const toggle = () => {
    setIsOpened((s) => !s)
  }
  const toast = useToast()
  const isMyMessage = useMemo(() => original?.user === name, [name, original?.user])
  
  // <Grid templateColumns='auto 50px' gap={2}>
  return (
    <Box>
      <Flex
        justifyContent='space-between'
        alignItems='center'
        mb={1}
      >
        <Flex alignItems='center'>
          {original?.status === EMessageStatus.Danger && <span style={{ marginRight: 'var(--chakra-space-2)' }}><ImFire size={13}/></span>}
          {original?.status === EMessageStatus.Warn && <span style={{ marginRight: 'var(--chakra-space-2)' }}><FiActivity size={14}/></span>}
          {original?.status === EMessageStatus.Success && <span style={{ marginRight: 'var(--chakra-space-3)' }}><FaCheck size={12}/></span>}
          {original?.status === EMessageStatus.Info && <span style={{ marginRight: 'var(--chakra-space-2)' }}><FaInfoCircle size={14}/></span>}
          {getDayMonth(tsTarget)}
        </Flex>
      </Flex>
      <Box mb={3}>
        <Flex justifyContent='space-between' alignItems='center'>
          <span
            // style={{ marginLeft: 'var(--chakra-space-2)' }}
          >
            <Countdown
              date={tsTarget}
              renderer={CountdownRenderer}
              onComplete={!!onComplete ? () => onComplete({ ts, text }) : undefined}
            />
          </span>
          <Flex className={styles['controls-btns']}>
            {
              isMyMessage && !!onEdit && (
                <Tooltip label='Edit' aria-label='EDIT'>
                  <IconButton
                    // style={{ marginRight: '.5rem' }}
                    size='xs'
                    aria-label="-EDIT"
                    colorScheme='green'
                    variant='outline'
                    isRound
                    icon={<AiTwotoneEdit size={15} />}
                    onClick={() => {
                      onEdit(original)
                    }}
                  >
                    EDIT
                  </IconButton>
                </Tooltip>
              )
            }
            {!!original?.assignedTo && !!original?.assignedBy && (
              <div
                style={{ display: 'flex' }}
              >
                <UserAva size={19} name={original.assignedBy} ml='auto' fontSize={11} onClick={() => { !!original.assignedBy && window.alert(`Assigned by ${original.assignedBy}`) }} />
                <div style={{ marginRight: '.5rem', marginLeft: '.5rem' }}>👉</div>
                <UserAva size={19} name={original.assignedTo[0]} fontSize={11} onClick={() => { !!original.assignedTo && window.alert(`Assigned to ${original.assignedTo[0]}`) }} />
              </div>)
            }
            {
              isLogged && !!original?.assignedTo && Array.isArray(original.assignedTo) && original.assignedTo.length > 0 && (
                <Tooltip label='Удалить из спринта' aria-label='REMOVE_FROM_SPRINT'>
                  <IconButton
                    size='xs'
                    aria-label="DEL"
                    colorScheme='red'
                    variant='outline'
                    isRound
                    icon={<IoMdClose size={15} />}
                    onClick={() => {
                      const isConfirmed = window.confirm('Вы точно хотите удалить это из спринта?')
                      if (isConfirmed) onRemove(ts)
                    }}
                  >
                    DEL
                  </IconButton>
                </Tooltip>
              )
            }
          </Flex>
        </Flex>
      </Box>
      <Box
        style={{
          // border: '1px solid red',
          // borderImage: `linear-gradient(to bottom, var(--chakra-colors-gray-200), rgba(0, 0, 0, 0)) 1 100%`,
          borderLeft: '4px solid var(--chakra-colors-gray-200)',
          borderTop: '1px solid var(--chakra-colors-gray-200)', // `1px ${isClosable ? isOpened ? 'solid' : 'dashed' : 'solid'} var(--chakra-colors-gray-200)`,
          borderTopLeftRadius: 'var(--chakra-radii-lg)',
          paddingTop: 'var(--chakra-space-1)',
          paddingLeft: 'var(--chakra-space-3)',
          whiteSpace: 'pre-wrap',
          // marginBottom: 'var(--chakra-space-1)'
        }}
        onClick={() => {
          scrollIntoView(
            ts,
            {
              fail: (ts) => {
                toast({
                  position: 'bottom',
                  title: `Сообщения ${ts} нет в отфильтрованных`,
                  description: 'Либо сделать догрузку списка, либо сбросить фильтры',
                  status: 'warning',
                  duration: 5000,
                })
              },
              success: (ts) => {
                toast({
                  position: 'bottom',
                  title: `Msg ${ts} In viewport`,
                  status: 'success',
                  duration: 3000,
                })
              },
            }
          )
        }}
        className='notif-box'
        // mb={3}
      >
        {
          !isClosable
          ? (
          <>
            <b>{text}</b>
            {/* <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{JSON.stringify(original, null, 2)}</pre> */}
          </>
        ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div>{isOpened ? <b>{text}</b> : <b>{firstString}</b>}</div>
              {/* <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{JSON.stringify(original, null, 2)}</pre> */}
              <div>
                <Button
                  mt={1}
                  // mb={2}
                  size='xs'
                  // isFullWidth
                  isLoading={inProgress}
                  onClick={toggle}
                  colorScheme='gray'
                  // variant='link'
                  variant='outline'
                  rounded='2xl'
                >{isOpened ? 'Close' : 'Open'}</Button>
              </div>
            </div>
          )
        }
      </Box>
      {/*
        !!original?.assignedTo && (
          <Box mb={3}>
            <AssignedBox
              position='right'
              // isMyMessage={isMyMessage}
              assignedTo={original.assignedTo}
              assignedBy={original.assignedBy || 'ERR'}
            />
          </Box>
        )
      */}
    </Box>
  )
}