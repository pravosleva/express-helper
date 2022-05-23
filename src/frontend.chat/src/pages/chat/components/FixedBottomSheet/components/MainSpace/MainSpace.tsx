import { memo } from 'react'
import { CircularProgress, CircularProgressLabel, Flex, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import styles from './MainSpace.module.scss'

type TProps = {
  dateDescr?: string,
  messagesTotalCounter: number,
  counters: {
    total: number,
    totalCards: number,
    doneLastWeek: number,
    doneLastMonth: number,
    doneLast3Months: number,
    danger: number,
    success: number,
  }
}

const MainSpaceMemoized = ({
  dateDescr,
  messagesTotalCounter,
  counters
}: TProps) => {
  const displayedPercentage = useMemo<number>(() => !!counters.totalCards ? ((Math.round((counters.total*100/counters.totalCards)*10/10))) : 0, [counters.totalCards, counters.total])
  const inProgressPercentage = useMemo<number>(() => !!(counters.success + counters.danger) ? ((Math.round((counters.success*100/(counters.success + counters.danger))*10/10))) : 0, [counters.success, counters.danger])

  return (
    <div className={styles['main-space']}>
      <Flex
        direction='column'
        justifyContent='center'
        // alignItems='center'
        height='100%'
      >
        <Text fontStyle='italic' fontWeight='bold'>Kanban</Text>
        {!!dateDescr && <Text fontStyle='italic' fontWeight='bold'>Since {dateDescr}</Text>}
      </Flex>
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
        <div className={styles['diagram']}>
          <CircularProgress value={displayedPercentage} color='gray.400'>
            <CircularProgressLabel>{displayedPercentage}%</CircularProgressLabel>
          </CircularProgress>
        </div>
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
        <div className={styles['diagram']}>
          <CircularProgress value={inProgressPercentage} color='green.400'>
            <CircularProgressLabel>{inProgressPercentage}%</CircularProgressLabel>
          </CircularProgress>
        </div>
      </div>
    </div>
  )
}

const propsAreEqual = (_pp: any, _np: any): boolean => false

export const MainSpace = memo(MainSpaceMemoized, propsAreEqual)
