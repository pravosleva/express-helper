import { memo, useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react'
import { Button, CircularProgress, CircularProgressLabel, Divider, Flex, HStack, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, StackDivider, Text, Tooltip, useToast, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import styles from './MainSpace.module.scss'
import { webWorkersInstance } from '~/utils'
import { EMessageStatus, TMessage } from '~/utils/interfaces'
import { TSetting } from '~/pages/chat/components/AccordionSettings'
import { InfoBox, PopoverInfoButton } from './components'
import { UserAva } from '~/pages/chat/components/UserAva'
import { getNormalizedDate } from '~/utils/timeConverter'
import equal from 'fast-deep-equal'

type TCounters = {
  total: number,
  totalCards: number,
  doneDetails:{
    lastWeek: {
      counter: number,
      items: TMessage[],
    }
    lastMonth: {
      counter: number,
      items: TMessage[],
    },
    last3Months: {
      counter: number,
      items: TMessage[],
    },
  },
  danger: number,
  dangerDetails: {
    items: TMessage[],
  },
  successDetails: {
    items: TMessage[],
  },
  success: number,
  infoDetails: {
    items: TMessage[],
  },
  users: {
    jobless: number,
    statusCountersMap: {
      [key: string]: number
    },
    statusMap: {
      [key: string]: {
        [key: string]: number
      }
    },
    joblessStatusMap: {
      [key: string]: {
        [key: string]: number
      }
    },
  },
}
type TProps = {
  dateDescr?: string,
  messagesTotalCounter: number,
  // counters: TCounters
  filteredMessages: TMessage[],
  filteredKanbanStatuses: EMessageStatus[],
  room: string,
  isFiltersActive: boolean,
  onCheckItOut: (ts: number) => void
  onCancelBlink: (ts: number) => void
}

const MainSpaceMemoized = ({
  dateDescr,
  messagesTotalCounter,
  // counters,
  filteredMessages,
  filteredKanbanStatuses,
  room,
  isFiltersActive,
  onCheckItOut,
  onCancelBlink,
}: TProps) => {
  const timers = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const [counters, setCounters] = useState<TCounters>({
    total: 0,
    totalCards: 0,
    doneDetails:{
      lastWeek: {
        counter: 0,
        items: [],
      },
      lastMonth: {
        counter: 0,
        items: [],
      },
      last3Months: {
        counter: 0,
        items: [],
      },
    },
    danger: 0,
    dangerDetails: {
      items: [],
    },
    successDetails: {
      items: [],
    },
    success: 0,
    infoDetails: {
      items: [],
    },
    users: {
      jobless: 0,
      statusCountersMap: {},
      statusMap: {},
      joblessStatusMap: {}
    },
  })

  const displayedPercentage = useMemo<number>(() => !!counters.totalCards ? ((Math.round((counters.total*100/counters.totalCards)*10/10))) : 0, [counters.totalCards, counters.total])
  const inProgressPercentage = useMemo<number>(() => !!(counters.success + counters.danger) ? ((Math.round((counters.success*100/(counters.success + counters.danger))*10/10))) : 0, [counters.success, counters.danger])

  useEffect(() => {
    webWorkersInstance.additionalWorker.onmessage = (
      $event: {
        [key: string]: any,
        data: { type: string, result: TCounters, perf: number }
      }
    ) => {
      try {
        const eventDataType = $event.data.type
  
        if (!!timers.current[eventDataType]) clearTimeout(timers.current[eventDataType])

        switch ($event.data.type) {
          case 'getCounters':
            timers.current[$event.data.type] = setTimeout(() => {
              // @ts-ignore
              setCounters($event.data.result)

              // console.log($event.data.result)
            }, 0)
            break;
          default: break;
        }
      } catch (err) {
        console.log(err)
      }
    }

    return () => {
      for (const key in timers.current) if (!!timers.current[key]) clearTimeout(timers.current[key])
    }
  }, [])
  // - NOTE: Exp
  const [assignmentSettingsLS, setAssignmentSettingsLS] = useState<{ [key: string]: { [key: string]: TSetting } }>({}) // useLocalStorageState2<{ [key: string]: { [key: string]: TSetting } }>('chat.assignment-feature.custom-settings', {})
  const [aUsersCounter, setAUsersCounter] = useState<number>(0)
  useLayoutEffect(() => {
    webWorkersInstance.additionalWorker.postMessage({
      type: 'getCounters',
      messages: filteredMessages,
      statuses: filteredKanbanStatuses,
      traceableUsers: (!!assignmentSettingsLS && !!assignmentSettingsLS[room]) ? Object.keys(assignmentSettingsLS[room]) : []
    })
  }, [filteredMessages, filteredKanbanStatuses, assignmentSettingsLS, room])
  // const [_effCounter, _setEffCounter] = useState<number>(0)
  const isFiltersInactive = useMemo(() => !isFiltersActive, [isFiltersActive])
  useLayoutEffect(() => {
    const run = () => {
      if (isFiltersInactive && typeof window !== 'undefined' && !document.hidden) {
        const val = window.localStorage.getItem('chat.assignment-feature.custom-settings')
        const parsedVal = JSON.parse(val || '{}')
        try {
          if (!!val) {
            if (!equal(val, parsedVal)) {
              console.log('--- not equal')
              console.log(val)
              console.log(parsedVal)
              setAssignmentSettingsLS(parsedVal)
            }
            if (aUsersCounter !== Object.keys(parsedVal[room]).length) setAUsersCounter(Object.keys(parsedVal[room] || {}).length)
          }
        } catch (err) {
          // console.log(err)
        }
        // _setEffCounter(s => s + 1)
      }
    }
    const interval = setInterval(run, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [isFiltersInactive, room, aUsersCounter, setAssignmentSettingsLS])
  // -

  // const handleClickDoneLastWeek = useCallback(() => {
  //   console.log(counters.doneDetails.lastWeek.items)
    
  // }, [counters?.doneDetails?.lastWeek?.items])

  const handleClickToCheckItOut = useCallback((ts: number) => () => {
    onCheckItOut(ts)
  }, [onCheckItOut])
  const handleMouseLeave = useCallback((ts: number) => () => {
    onCancelBlink(ts)
  }, [onCancelBlink])

  return (
    <div className={styles['main-space']}>
      <Flex
        direction='column'
        justifyContent='center'
        // alignItems='center'
        height='100%'
      >
        <Text fontStyle='italic' fontWeight='bold'>Kanban</Text>
        {!!dateDescr && <Text fontStyle='italic' fontWeight='bold'>Подгружено {messagesTotalCounter} (с {dateDescr})</Text>}
      </Flex>
      {
        isFiltersInactive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PopoverInfoButton
              headerRenderer={() => <b>Свободные пользователи</b>}
              triggerRenderer={() => (
                <Button>Jobless: {counters.users?.jobless}</Button>
              )}
              bodyRenderer={() => (
                <>
                  <b>Jobless</b> - Имеются ввиду юзеры для которых выполнены условия:
                  <ul style={{ paddingLeft: 'var(--chakra-space-4)' }}>
                    <li>добавлен в список отслеживаемых <code>assignmentFeature</code> (сейчас {aUsersCounter} в списке)</li>
                    <li>назначена хотя бы одна задача</li>
                    <li>нет задач в статусах <b>🔥 Danger</b> & <b>✅ Success</b></li>
                  </ul>
                  {!!counters.users?.joblessStatusMap && Object.keys(counters.users.joblessStatusMap).length > 0 && (
                    <pre style={{
                      fontSize: '1em',
                      padding: '5px',
                      // color: '#FFF',
                      borderRadius: 0,
                      maxHeight: '200px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowY: 'auto',
                    }}>{JSON.stringify(counters.users?.joblessStatusMap, null, 2)}</pre>
                  )}
                </>
              )}
            />
          </div>
        )
      }
      <div className={styles['stat-box']}>
        <Flex
          direction='column'
          justifyContent='center'
          alignItems='flex-start'
          height='100%'
          pr={1}
        >

          <InfoBox
            triggerColorScheme='red'
            popupHeader={<b>In status Danger total ({counters.dangerDetails.items.length})</b>}
            label={<span>🔥 In work</span>}
            counter={counters.dangerDetails.items.length}
            items={counters.dangerDetails.items}
            onClickToCheckItOut={handleClickToCheckItOut}
            onMouseLeave={handleMouseLeave}
            noMultiline
          />
          
          <InfoBox
            triggerColorScheme='green'
            popupHeader={<b>In status Success total ({counters.successDetails.items.length})</b>}
            label={<span>✅ On testing</span>}
            counter={counters.successDetails.items.length}
            items={counters.successDetails.items}
            onClickToCheckItOut={handleClickToCheckItOut}
            onMouseLeave={handleMouseLeave}
            noMultiline
          />

          {/* <Text>Kanban displayed: {counters.total}</Text> */}

          <InfoBox
            triggerColorScheme='blue'
            popupHeader={<b>In status Info total ({counters.infoDetails.items.length})</b>}
            label={<span>ℹ️ Info</span>}
            counter={counters.infoDetails.items.length}
            items={counters.infoDetails.items}
            onClickToCheckItOut={handleClickToCheckItOut}
            onMouseLeave={handleMouseLeave}
            noMultiline
          />

        </Flex>
        
        {/* <Tooltip label='Отображено задач, имеющих статус' aria-label='DISPLAYED' hasArrow>
          <div className={styles['diagram']}>
            <CircularProgress value={displayedPercentage} color='gray.400'>
              <CircularProgressLabel>{displayedPercentage}%</CircularProgressLabel>
            </CircularProgress>
          </div>
        </Tooltip> */}
        
        <Flex
          direction='column'
          justifyContent='center'
          alignItems='flex-start'
          height='100%'
          pr={1}
        >

          <InfoBox
            triggerColorScheme='gray'
            popupHeader={<b>Done last week ({counters.doneDetails.lastWeek.counter})</b>}
            label={<span>☑️ Last week</span>}
            counter={counters.doneDetails.lastWeek.counter}
            items={counters.doneDetails.lastWeek.items}
            onClickToCheckItOut={handleClickToCheckItOut}
            onMouseLeave={handleMouseLeave}
            noMultiline
          />
          <InfoBox
            triggerColorScheme='gray'
            popupHeader={<b>Done last 30 days ({counters.doneDetails.lastMonth.counter})</b>}
            label={<span>☑️ Last 1 mon</span>}
            counter={counters.doneDetails.lastMonth.counter}
            items={counters.doneDetails.lastMonth.items}
            onClickToCheckItOut={handleClickToCheckItOut}
            onMouseLeave={handleMouseLeave}
            noMultiline
          />
          <InfoBox
            triggerColorScheme='gray'
            popupHeader={<b>Done last 90 days ({counters.doneDetails.last3Months.counter})</b>}
            label={<span>☑️ Last 3 mon</span>}
            counter={counters.doneDetails.last3Months.counter}
            items={counters.doneDetails.last3Months.items}
            onClickToCheckItOut={handleClickToCheckItOut}
            onMouseLeave={handleMouseLeave}
            noMultiline
          />
          
        </Flex>
        
        <Tooltip label='То что на тестировании ✅ по отношению к сумме: 🔥 + ✅' aria-label='ON_TEST' hasArrow>
          <div className={styles['diagram']}>
            <CircularProgress value={inProgressPercentage} color='green.400'>
              <CircularProgressLabel>{inProgressPercentage}%</CircularProgressLabel>
            </CircularProgress>
          </div>
        </Tooltip>
        
      </div>
    </div>
  )
}

const propsAreEqual = (_pp: any, _np: any): boolean => false

export const MainSpace = memo(MainSpaceMemoized, propsAreEqual)
