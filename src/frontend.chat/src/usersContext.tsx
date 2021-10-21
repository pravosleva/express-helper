import { useState, createContext, useContext, useEffect, useCallback, useMemo } from 'react'
import { useMainContext } from '~/mainContext'
import { SocketContext } from '~/socketContext'
import { PollingComponent } from '~/common/components/PollingComponent'
import { useLocalStorage } from 'react-use'

type TUser = { name: string; room: string; socketId: string }
type TUsersContext = {
  users: TUser[]
  allUsers: TUser[]
  setUsers: (_users: TUser[]) => void
  tasklist: any
  // setTasklist: (tl: any) => void
}

export const UsersContext = createContext<TUsersContext>({
  users: [],
  setUsers: (_users: TUser[]) => {},
  allUsers: [],
  tasklist: [],
  // setTasklist: (_tl: any) => {}
})

type TLocalRoomItem = {
  name: string
  ts: number
}

export const UsersProvider = ({ children }: any) => {
  const [users, setUsers] = useState<TUser[]>([])
  const [allUsers, setAllUsers] = useState<TUser[]>([])
  const { socket } = useContext(SocketContext)
  const { slugifiedRoom, setTsMap } = useMainContext()
  const [tasklist, setTasklist] = useState<any[]>([])

  useEffect(() => {
    const sUListener = (users: TUser[]) => {
      setUsers(users)
    }
    const aUListener = (users: TUser[]) => {
      setAllUsers(users)
    }
    const tlListener = ({ tasklist }: any) => {
      setTasklist(tasklist)
    }
    const tsMapListener = (data: {[key: string]: number}) => {
      // console.log(data)
      setTsMap(data)
    }
    if (!!socket) socket.on('users', sUListener)
    if (!!socket) socket.on('tasklist', tlListener)
    if (!!socket) socket.on('allUsers', aUListener)
    if (!!socket) socket.on('tsMap', tsMapListener)

    return () => {
      if (!!socket) socket.off('users', sUListener)
      if (!!socket) socket.off('tasklist', tlListener)
      if (!!socket) socket.off('allUsers', aUListener)
      if (!!socket) socket.off('tsMap', tsMapListener)
    }
  }, [setUsers, setAllUsers, socket, socket?.connected])

  const getUsers = useCallback(() => {
    if (!!socket) socket.emit('getUsers', { room: slugifiedRoom })
  }, [slugifiedRoom, socket])
  const getTasklist = useCallback(() => {
    if (!!socket) socket.emit('getTasklist', { room: slugifiedRoom })
  }, [slugifiedRoom, socket])

  useEffect(() => {
    getUsers()
    getTasklist()
  }, [socket, socket?.connected, slugifiedRoom])

  const [roomlistLS, _setRoomlistLS] = useLocalStorage<TLocalRoomItem[]>('chat.roomlist', [])
  const getTsPromise = useCallback(() => {
    if (!!window) {
      let roomlistLS: any

      try {
        roomlistLS = JSON.parse(window.localStorage.getItem('chat.roomlist') || '[]')
        // @ts-ignore
        const roomNames = !!roomlistLS ? roomlistLS.filter(({ name }) => !!name).map(({ name }) => name) : []

        // if (!!socket) socket.emit('getTsMap', { rooms: roomNames })
        if (!!socket) socket.volatile.emit('getTsMap', { rooms: roomNames })

        return Promise.resolve()
      } catch (err) {
        return Promise.reject()
      }
    }
    return Promise.reject()
  }, [JSON.stringify(roomlistLS), socket, socket?.connected])

  return (
    <>
      <PollingComponent
        promise={getTsPromise}
        onSuccess={(data) => {
          console.log(`SUCCESS: ${JSON.stringify(data)}`)
        }}
        resValidator={() => false}
      />
      <UsersContext.Provider value={{ tasklist, users, setUsers, allUsers }}>{children}</UsersContext.Provider>
    </>
  )
}

export const useUsersContext = () => useContext(UsersContext)
