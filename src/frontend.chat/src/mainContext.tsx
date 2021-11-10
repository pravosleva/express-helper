import React, { useState, createContext, useEffect, useContext } from 'react'
import slugify from 'slugify'

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
})

export const MainProvider = ({ children }: any) => {
  const [name, setName] = useState<string>('')
  const [room, setRoom] = useState<string>('')
  const [slugifiedRoom, setNormalizedRoom] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [tsMap, setTsMap] = useState<{[key: string]: number}>({})

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
        }}
      >
        {children}
      </MainContext.Provider>
    </>
  )
}

export const useMainContext = () => useContext(MainContext)
