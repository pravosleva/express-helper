import { useState, createContext, useContext, useEffect, useCallback } from 'react'
import { useMainContext } from '~/mainContext'
import { SocketContext } from '~/socketContext'
import { useDebouncedCallback } from '~/common/hooks/useDebouncedCallback'

type TUser = { name: string; room: string; socketId: string }
type TUsersContext = {
  users: TUser[]
  allUsers: TUser[]
  setUsers: (_users: TUser[]) => void
}

export const UsersContext = createContext<TUsersContext>({
  users: [],
  setUsers: (_users: TUser[]) => {},
  allUsers: [],
})

export const UsersProvider = ({ children }: any) => {
  const [users, setUsers] = useState<TUser[]>([])
  const [allUsers, setAllUsers] = useState<TUser[]>([])
  const { socket } = useContext(SocketContext)
  const { slugifiedRoom } = useMainContext()

  useEffect(() => {
    const sUListener = (users: TUser[]) => {
      setUsers(users)
    }
    const aUListener = (users: TUser[]) => {
      setAllUsers(users)
    }
    if (!!socket) socket.on('users', sUListener)
    if (!!socket) socket.on('allUsers', aUListener)

    return () => {
      if (!!socket) socket.off('users', sUListener)
      if (!!socket) socket.off('allUsers', aUListener)
    }
  }, [setUsers, setAllUsers, socket, socket?.connected])
  const getUsers = useCallback(() => {
    if (!!socket) {
      socket.emit('getUsers', { room: slugifiedRoom })
    }
  }, [slugifiedRoom, socket])
  const [handleDebouncedGetUsers] = useDebouncedCallback({
    callback: getUsers,
    wait: 1000,
  })
  useEffect(() => {
    handleDebouncedGetUsers()
  }, [slugifiedRoom, handleDebouncedGetUsers])

  return <UsersContext.Provider value={{ users, setUsers, allUsers }}>{children}</UsersContext.Provider>
}

export const useUsersContext = () => useContext(UsersContext)
