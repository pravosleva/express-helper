import { useState, createContext, useContext, useEffect, useCallback } from 'react'
import { useMainContext } from '~/mainContext'
import { SocketContext } from '~/socketContext'

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

export const UsersProvider = ({ children }: any) => {
  const [users, setUsers] = useState<TUser[]>([])
  const [allUsers, setAllUsers] = useState<TUser[]>([])
  const { socket } = useContext(SocketContext)
  const { slugifiedRoom } = useMainContext()
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
    if (!!socket) socket.on('users', sUListener)
    if (!!socket) socket.on('tasklist', tlListener)
    if (!!socket) socket.on('allUsers', aUListener)

    return () => {
      if (!!socket) socket.off('users', sUListener)
      if (!!socket) socket.off('tasklist', tlListener)
      if (!!socket) socket.off('allUsers', aUListener)
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
  }, [socket, socket?.connected])

  return <UsersContext.Provider value={{ tasklist, users, setUsers, allUsers }}>{children}</UsersContext.Provider>
}

export const useUsersContext = () => useContext(UsersContext)
