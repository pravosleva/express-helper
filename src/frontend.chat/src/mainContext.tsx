import React, { useState, createContext, useEffect, useContext , useRef, MutableRefObject} from 'react'
import slugify from 'slugify'
import { getNormalizedString } from '~/utils/strings-ops'
import { proxy } from 'valtio'
import { useLocalStorage } from 'react-use'
// const state = useSnapshot(sprintFeatureProxy)

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
  isFetureEnabled: boolean
}
const assignmentFeatureProxy = proxy<TAssignmentInfo>({
  isFetureEnabled: false
})

type TMainContext = {
  sprintFeatureProxy: Partial<typeof Proxy> & TSprintFeature
  userInfoProxy: Partial<typeof Proxy> & TUserInfo
  assignmentFeatureProxy: Partial<typeof Proxy> & TAssignmentInfo
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
}

export const MainContext = createContext<TMainContext>({
  sprintFeatureProxy,
  userInfoProxy,
  assignmentFeatureProxy,
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
  tsMapRef: { current: {} }
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
  
  useEffect(() => {
    // NOTE: Императивный доступ для сравнения в эффекте без лишней зависимости
    tsMapRef.current = tsMap
  }, [tsMap])

  // const [lastRoomLS, setLastRoomLS, _removeLastRoomLS] = useLocalStorage<string>('chat.last-room', '')
  // useEffect(() => {
  //   if (!!lastRoomLS) setRoom(lastRoomLS)
  // }, [])

  useEffect(() => {
    setNormalizedRoom(slugify(room.trim().toLowerCase()))
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
        }}
      >
        {children}
      </MainContext.Provider>
    </>
  )
}

export const useMainContext = () => useContext(MainContext)
