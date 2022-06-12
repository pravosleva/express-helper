import { memo, useLayoutEffect, useRef, useState, useEffect } from 'react'
import { Button, CircularProgress, CircularProgressLabel, Flex, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, Tooltip } from '@chakra-ui/react'
import { useMemo } from 'react'
import styles from './MainSpace.module.scss'
import { webWorkersInstance } from '~/utils'
import { EMessageStatus, TMessage } from '~/utils/interfaces'
import { TSetting } from '~/pages/chat/components/AccordionSettings'

type TCounters = {
  total: number,
  totalCards: number,
  doneLastWeek: number,
  doneLastMonth: number,
  doneLast3Months: number,
  danger: number,
  success: number,
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
  isFiltersActive: boolean
}

const MainSpaceMemoized = ({
  dateDescr,
  messagesTotalCounter,
  // counters,
  filteredMessages,
  filteredKanbanStatuses,
  room,
  isFiltersActive,
}: TProps) => {
  const timers = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const [counters, setCounters] = useState<TCounters>({
    total: 0,
    totalCards: 0,
    doneLastWeek: 0,
    doneLastMonth: 0,
    doneLast3Months: 0,
    danger: 0,
    success: 0,
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
  const [_effCounter, _setEffCounter] = useState<number>(0)
  const isFiltersInactive = useMemo(() => !isFiltersActive, [isFiltersActive])
  useEffect(() => {
    const run = () => {
      if (isFiltersInactive && typeof window !== 'undefined' && !document.hidden) {
        const val = window.localStorage.getItem('chat.assignment-feature.custom-settings')
        const parsedVal = JSON.parse(val || '{}')
        try {
          if (!!val) {
            setAssignmentSettingsLS(parsedVal)
            setAUsersCounter(Object.keys(parsedVal[room]).length)
          }
        } catch (err) {
          console.log(err)
        }
        _setEffCounter(s => s + 1)
      }
    }
    setTimeout(run, 1000)
  }, [_effCounter, _setEffCounter, isFiltersInactive])
  // -

  return (
    <div className={styles['main-space']}>
      <Flex
        direction='column'
        justifyContent='center'
        // alignItems='center'
        height='100%'
      >
        <Text fontStyle='italic' fontWeight='bold'>Kanban</Text>
        {!!dateDescr && <Text fontStyle='italic' fontWeight='bold'>Подгружено с {dateDescr}</Text>}
      </Flex>
      {
        isFiltersInactive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Popover>
              <PopoverTrigger>
                <Button>Jobless users {counters.users?.jobless}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Свободные пользователи</PopoverHeader>
                <PopoverBody>
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
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </div>
        )
      }
      <div className={styles['stat-box']}>
        <Flex
          direction='column'
          justifyContent='center'
          alignItems='flex-start'
          height='100%'
        >
          <Text>Total cards: {counters.totalCards}</Text>
          <Text>Kanban displayed: {counters.total}</Text>
          <Text>Msgs loaded: {messagesTotalCounter}</Text>
        </Flex>
        <Tooltip label='Отображено задач, имеющих статус' aria-label='DISPLAYED' hasArrow>
          <div className={styles['diagram']}>
            <CircularProgress value={displayedPercentage} color='gray.400'>
              <CircularProgressLabel>{displayedPercentage}%</CircularProgressLabel>
            </CircularProgress>
          </div>
        </Tooltip>
        <Flex
          direction='column'
          justifyContent='center'
          alignItems='flex-start'
          height='100%'
        >
          <Text>Done last week: {counters.doneLastWeek}</Text>
          <Text>Done last month: {counters.doneLastMonth}</Text>
          <Text>Done last 3 mth: {counters.doneLast3Months}</Text>
        </Flex>
        <Tooltip label='На тестировании из того что в работе' aria-label='ON_TEST' hasArrow>
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
