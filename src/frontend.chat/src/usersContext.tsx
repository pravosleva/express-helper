import React, { useState, createContext, useContext, useEffect, useCallback, useMemo } from 'react'
import { useMainContext } from '~/mainContext'
import { SocketContext } from '~/socketContext'
import { PollingComponent } from '~/common/components/PollingComponent'
import { useLocalStorage } from 'react-use'
import { TTask } from './pages/chat/components/TasklistModal/types'
import { binarySearchTsIndex } from '~/utils/sort/binarySearch'

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
  const { slugifiedRoom, setTsMap, room, name, tsMapRef } = useMainContext()
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
    const tlAIListener = ({ task }: { task: TTask }) => {
      setTasklist(tl => [...tl, task])
    }
    const tlUIListener = ({ task }: { task: TTask }) => {
      setTasklist(tl => {
        const targetIndex = binarySearchTsIndex({ messages: tl, targetTs: task.ts })

        if (targetIndex !== -1) {
          const newTl = [...tl]

          newTl[targetIndex] = task

          return newTl
        } else {
          return [...tl, task]
        }
      })
    }
    const tlDIListener = ({ ts }: { ts: number }) => {
      setTasklist(tl => {
        const newArr = [...tl]
        const targetIndex = binarySearchTsIndex({ messages: tl, targetTs: ts })

        if (targetIndex !== -1) newArr.splice(targetIndex, 1)
        return newArr
      })
    }
    const tsMapListener = (data: {[key: string]: number}) => {
      if (JSON.stringify(tsMapRef.current) !== JSON.stringify(data)) {
        setTsMap(data)
      }
    }

    if (!!socket) socket.on('users:room', sUListener)
    if (!!socket) socket.on('tasklist', tlListener)
    if (!!socket) socket.on('tasklist.update-item', tlUIListener)
    if (!!socket) socket.on('tasklist.delete-item', tlDIListener)
    if (!!socket) socket.on('tasklist.add-item', tlAIListener)
    if (!!socket) socket.on('allUsers', aUListener)
    if (!!socket) socket.on('tsMap', tsMapListener)

    return () => {
      if (!!socket) socket.off('users:room', sUListener)
      if (!!socket) socket.off('tasklist', tlListener)
      if (!!socket) socket.off('tasklist.update-item', tlUIListener)
      if (!!socket) socket.off('tasklist.delete-item', tlDIListener)
      if (!!socket) socket.off('tasklist.add-item', tlAIListener)
      if (!!socket) socket.off('allUsers', aUListener)
      if (!!socket) socket.off('tsMap', tsMapListener)
    }
  }, [setUsers, setAllUsers, socket, socket?.connected, room])

  const getUsers = useCallback(() => {
    if (!!socket) socket.emit('users.room', { room: slugifiedRoom })
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
