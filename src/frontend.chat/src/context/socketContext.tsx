import React, { createContext, useEffect, useState, useContext, useRef, useMemo, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import { useToast } from "@chakra-ui/react"
import { debounce } from 'lodash'

const REACT_APP_WS_API_URL = process.env.REACT_APP_WS_API_URL || '/'

type TMessage = {
  text: string
  user: string
  ts: number
  editTs?: number
  name: string
}
type TRoomData = TMessage[]

interface ISocketContext {
  socket: Socket | null
  roomData: TRoomData
  isLogged: boolean
  setIsLogged: (val: boolean) => void
  isConnected: boolean
  setIsConnected: (val: boolean) => void
  resetRoomData: () => void
}

export const SocketContext = createContext<ISocketContext>({
  socket: null,
  roomData: [],
  isLogged: false,
  setIsLogged: () => {},
  isConnected: false,
  setIsConnected: () => {},
  resetRoomData: () => {}
})

export const SocketProvider =
  ({ children }: any) => {
    const socket: Socket = useMemo(() => io(REACT_APP_WS_API_URL, {
      reconnection: true,
      transports: ['websocket', 'polling'],
    }), [])
    // const toast = useToast()
    const [roomData, setRoomData] = useState<TRoomData>([])
    const resetRoomData = () => {
      setRoomData([])
    }
    const [isLogged, setIsLogged] = useState<boolean>(false)
    const [isConnected, setIsConnected] = useState<boolean>(true)
    const isConnectedRef = useRef<boolean>(false)
    const socketIdRef = useRef<string | null>(null)

    const toast = useToast()
    useEffect(() => {
      console.log(`EFF: isConnected= ${isConnected}`)
      if (isConnected) toast({
        position: 'top',
        title: 'Connected...',
        // description: notif?.description,
        status: 'success',
        duration: 3000,
      })
      else toast({
        position: 'top',
        title: 'Connection lost...',
        // description: notif?.description,
        status: 'error',
        duration: 10000,
        isClosable: true,
      })
    }, [isConnected])

    const disconnListener = useCallback(() => {
      setIsConnected(false)
      isConnectedRef.current = false
      socketIdRef.current = null
    }, [])
    const connListener = useCallback(() => {
      setIsConnected(true)
      isConnectedRef.current = true
      socketIdRef.current = socket.id
    }, [])
    const connErrListener = useCallback((reason: any) => {
      console.log(reason)
    }, [])
    const onSubscribe = useMemo(() => debounce(() => {
      socket.on('disconnect', disconnListener)
      socket.on('connect', connListener)
      socket.on('connect_error', connErrListener)
    }, 2000), [])
    const onUnsubscribe = useMemo(() => debounce(() => {
      socket.off('disconnect', disconnListener)
      socket.off('connect', connListener)
      socket.off('connect_error', connErrListener)
    }, 0), [])

    useEffect(() => {
      console.log('EFF: mount')
      onSubscribe()

      return () => {
        onUnsubscribe()
      }
    }, [])

    return (
      <SocketContext.Provider value={{
        socket,
        roomData,
        isLogged,
        setIsLogged,
        isConnected,
        setIsConnected,
        resetRoomData,
      }}>
        {children}
      </SocketContext.Provider>
    )
  }

export const useSocketContext = () => useContext(SocketContext)
