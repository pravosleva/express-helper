import React, { useState, createContext, useEffect, useContext , useRef, MutableRefObject} from 'react'
import slugify from 'slugify'
import { getNormalizedString } from '~/utils/strings-ops'

type TMainContext = {
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

  useEffect(() => {
    setNormalizedRoom(slugify(room.trim().toLowerCase()))
  }, [room, setNormalizedRoom])

  return (
    <>
      <MainContext.Provider
        value={{
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
