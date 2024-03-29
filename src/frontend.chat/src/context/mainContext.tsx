import React, { useEffect, useState, createContext, useLayoutEffect, useContext , useRef, MutableRefObject} from 'react'
import slugify from 'slugify'
import { getNormalizedString } from '~/utils/strings-ops'
import { proxy } from 'valtio'
import { useLocalStorage } from 'react-use'
// const state = useSnapshot(sprintFeatureProxy)
import { Systeminformation } from 'systeminformation'
import { useLatest } from '~/common/hooks/useLatest'

type TUserInfo = {
  regData: any
}
const userInfoProxy = proxy<TUserInfo>({
  regData: {}
})
type TSprintFeature = {
  commonNotifs: any
  inProgress: number[]
  isFeatureEnabled: boolean
  tsUpdate: number
  hasCompleted: boolean
  isEmptyStateConfirmed: boolean
  isPollingWorks: boolean
}
const initialSprintState: TSprintFeature = {
  commonNotifs: {},
  inProgress: [],
  isFeatureEnabled: false,
  tsUpdate: Date.now(),
  hasCompleted: false,
  isEmptyStateConfirmed: false,
  isPollingWorks: false,
}
const sprintFeatureProxy = proxy<TSprintFeature>(initialSprintState)

type TAssignmentInfo = {
  isFeatureEnabled: boolean
}
const assignmentFeatureProxy = proxy<TAssignmentInfo>({
  isFeatureEnabled: false
})

type TDevtoolsInfo = {
  isFeatureEnabled: boolean;
  isSprintPollUsedInMainThreadOnly: boolean
}
const devtoolsFeatureProxy = proxy<TDevtoolsInfo>({
  isFeatureEnabled: false,
  isSprintPollUsedInMainThreadOnly: false,
})

type TCPUInfo = {
  mem: Systeminformation.MemData | null
  ts: number
}
const cpuFeatureProxy = proxy<TCPUInfo>({
  mem: null,
  ts: Date.now()
})

type TMainContext = {
  sprintFeatureProxy: Partial<typeof Proxy> & TSprintFeature
  userInfoProxy: Partial<typeof Proxy> & TUserInfo
  assignmentFeatureProxy: Partial<typeof Proxy> & TAssignmentInfo
  devtoolsFeatureProxy: Partial<typeof Proxy> & TDevtoolsInfo
  cpuFeatureProxy: Partial<typeof Proxy> & TCPUInfo
  name: string
  room: string
  setName: (name: string) => void
  setRoom: (room: string) => void
  slugifiedRoom: string
  isAdmin: boolean
  setIsAdmin: (room: boolean) => void
  tsMap: {[key: string]: number},
  setTsMap: (_val: {[key: string]: number}) => void
  tsMapRef: MutableRefObject<{[key: string]: number}>
  roomRef: MutableRefObject<string>
  // setLastRoomLS: (room: string) => void
}

export const MainContext = createContext<TMainContext>({
  sprintFeatureProxy,
  userInfoProxy,
  assignmentFeatureProxy,
  devtoolsFeatureProxy,
  cpuFeatureProxy,
  name: '',
  room: '',
  setName: (_name: string) => {
    throw new Error('setName should be implemented')
  },
  setRoom: (_room: string) => {
    throw new Error('setRoom should be implemented')
  },
  slugifiedRoom: '',
  isAdmin: false,
  setIsAdmin: (_val: boolean) => {
    throw new Error('setIsAdmin should be implemented')
  },
  tsMap: {},
  setTsMap: (_val: {[key: string]: number}) => {
    throw new Error('setTsMap should be implemented')
  },
  tsMapRef: { current: {} },
  roomRef: { current: '' },
  // setLastRoomLS: (room: string) => {
  //   throw new Error('setLastRoomLS should be implemented')
  // }
})

export const MainProvider = ({ children }: any) => {
  const [name, _setName] = useState<string>('')
  const setName = (s: string) => {
    const normalized = getNormalizedString(s)
    _setName(normalized)
  }
  const [room, _setRoom] = useState<string>('')
  const setRoom = (s: string) => {
    const normalized = getNormalizedString(s)
    _setRoom(normalized)
  }
  const [slugifiedRoom, setNormalizedRoom] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [tsMap, setTsMap] = useState<{[key: string]: number}>({})
  
  const tsMapRef = useRef<{[key: string]: number}>({})
  useLayoutEffect(() => {
    // NOTE: Императивный доступ для сравнения в эффекте без лишней зависимости
    tsMapRef.current = tsMap
  }, [tsMap])

  const roomRef = useLatest(room)

  const [_lastRoomLS, setLastRoomLS, _removeLastRoomLS] = useLocalStorage<string>('chat.last-room', '')

  useLayoutEffect(() => {
    const normRoom = slugify(room.trim().toLowerCase())
    if (!!normRoom) {
      setNormalizedRoom(normRoom)
      setLastRoomLS(normRoom)
    }
  }, [room, setNormalizedRoom])

  // const [nameLS, _setNameLS, _removeNameLS] = useLocalStorage<string>('chat.my-name', '')
  // useEffect(() => {
  //   if (!!nameLS) setName(nameLS)
  // }, [nameLS])

  return (
    <>
      <MainContext.Provider
        value={{
          sprintFeatureProxy,
          userInfoProxy,
          assignmentFeatureProxy,
          devtoolsFeatureProxy,
          cpuFeatureProxy,
          name,
          room,
          slugifiedRoom,
          setName,
          setRoom,
          isAdmin,
          setIsAdmin,
          tsMap,
          setTsMap,
          tsMapRef,
          roomRef,
        }}
      >
        {children}
      </MainContext.Provider>
    </>
  )
}

export const useMainContext = () => useContext(MainContext)
