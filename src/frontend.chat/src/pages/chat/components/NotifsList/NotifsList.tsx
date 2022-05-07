import { useState, useMemo, useEffect } from 'react'
import { useMainContext } from '~/context/mainContext'
import axios from 'axios'
import { PollingComponent } from './components/PollingComponent'
import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { NotifItem } from './components/NotifItem'
import { useSnapshot, subscribe } from 'valtio'
import { TMessage, EMessageStatus } from '~/utils/interfaces'
// const sprintFeatureSnap = useSnapshot(sprintFeatureProxy)
// import { FiltersGrid } from './components/FiltersGrid'
import { FiltersGrid } from '~/pages/chat/components/AccordionSettings/components/FiltersGrid'
import { useCompare } from '~/common/hooks/useDeepEffect'

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || ''

export enum EAPIRoomNotifsCode {
  IncorrectParams = 'incorrect_params',
  NotFound = 'not_found',
  NoUpdates = 'no_updates',
  Updated = 'updated',

  Errored = 'errored',
  Exists = 'exists',
}

export type TNotifItem = {
  ts: number
  username: string
  tsTarget: number
  text: string
  original: TMessage
}
type TData = { [key: string]: TNotifItem }
export type TRoomNotifs = {
  tsUpdate: number
  data: TData
}
type TRes = {
  ok: boolean
  code: string
  message: string
  tsUpdate?: number
  state?: any
  ts?: number
}

function dynamicSort(property: string) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a: any, b: any) {
    /* next line works with strings and numbers, 
      * and you may want to customize it to your needs
      */
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

type TProps = {
  onRemove: (ts: number) => void
  onEdit?: (m: TMessage) => void
}

export const NotifsList = ({ onRemove, onEdit }: TProps) => {
  const { room, sprintFeatureProxy } = useMainContext()
  const sprintFeatureSnap = useSnapshot(sprintFeatureProxy)

  const handleRemoveCommonNotif = async (ts: number) => {
    sprintFeatureProxy.inProgress = [...new Set([...sprintFeatureProxy.inProgress, ts])]
    const data = { room_id: room, ts  }
    const result = await axios.post(`${REACT_APP_API_URL}/chat/api/common-notifs/remove`, {
      ...data,
    })
      .then((res) => {
        // console.log(res.data.stateChunk)
        return res.data
      })
      .catch((err) => err)
      .finally(() => {
        sprintFeatureProxy.inProgress = sprintFeatureProxy.inProgress.filter((_ts: number) => _ts !== ts)
        if (!!sprintFeatureProxy.commonNotifs[String(ts)]) delete sprintFeatureProxy.commonNotifs[String(ts)]
      })
    if (result.ok) onRemove(result.tsUpdate)
  }
  const notifsStateArr: TNotifItem[] = useMemo(() => {
    if (!!sprintFeatureSnap.commonNotifs && Object.keys(sprintFeatureSnap.commonNotifs).length === 0) return []
    const arr: TNotifItem[] = []
    
    for (const tsStr in sprintFeatureSnap.commonNotifs) arr.push(sprintFeatureSnap.commonNotifs[tsStr])

    return arr
  }, [sprintFeatureSnap.commonNotifs])

  const [activeFilters, setActiveFilters] = useState<EMessageStatus[]>([])
  const filteredNotifs = useMemo(() => {
    return notifsStateArr.filter(({ original }) => activeFilters.length > 0 ? !!original?.status ? activeFilters.includes(original.status) : false : true)
  }, [useCompare([notifsStateArr, activeFilters])])

  const MemoNotifs = useMemo(() => filteredNotifs.sort(dynamicSort('tsTarget')).map(({ ts, text, tsTarget, original }) => {
    const isLoading = sprintFeatureSnap.inProgress.includes(ts)
    return (
    <NotifItem
      original={original}
      inProgress={isLoading}
      tsTarget={tsTarget}
      key={String(ts)}
      ts={ts}
      onRemove={handleRemoveCommonNotif}
      text={text}
      onComplete={({ ts }) => {
        sprintFeatureProxy.hasCompleted = true
      }}
      onEdit={onEdit}
    />
  )}), [filteredNotifs, sprintFeatureSnap.inProgress, sprintFeatureSnap.commonNotifs])

  return (
    <>
      {
        sprintFeatureSnap.isPollingWorks && (
          <FiltersGrid
            toggleFilter={(status) => {
              if (activeFilters.includes(status)) {
                setActiveFilters((fs) => fs.filter((s) => s !== status))
              } else {
                setActiveFilters((fs) => [...fs, status])
              }
            }}
            onSetFilters={(fs) => setActiveFilters(fs)}
            allNotifs={notifsStateArr}
            activeFilters={activeFilters}
          />
        )
      }
      {
        !sprintFeatureSnap.isEmptyStateConfirmed ?
          notifsStateArr.length === 0
            ? <Text style={{ textAlign: 'center' }}><em>Loading...</em></Text>
            : <Stack spacing={4}>{MemoNotifs}</Stack>
            : <Text style={{ textAlign: 'center' }}>Nothing yet...</Text>
      }
      {/* <pre>{JSON.stringify(notifsStateArr, null, 2)}</pre> */}
    </>
  )
}
