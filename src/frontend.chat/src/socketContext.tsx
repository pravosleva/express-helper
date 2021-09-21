import { createContext, useEffect, useState, useContext } from 'react'
import io, { Socket } from 'socket.io-client'
// import { useToast } from "@chakra-ui/react"

const REACT_APP_WS_API_URL = process.env.REACT_APP_WS_API_URL || '/'

type TMessage = {
  text: string
  user: string
  ts: number
}
type TRoomData = {
  [userName: string]: TMessage[]
}

interface ISocketContext {
  socket: Socket | null
  roomData: TRoomData
  isLogged: boolean
  setIsLogged: (val: boolean) => void
  isConnected: boolean
  setIsConnected: (val: boolean) => void
  // regData: { registryLevel: number } | null
  // setRegData: (val: { registryLevel: number } | null) => void
}

export const SocketContext = createContext<ISocketContext>({
  socket: null,
  roomData: {},
  isLogged: false,
  setIsLogged: () => {},
  isConnected: false,
  setIsConnected: () => {},
  // regData: null,
  // setRegData: (_val: { registryLevel: number } | null) => {
  //   throw new Error('setRegData should be implemented')
  // },
})

export const SocketProvider =
  ({ children }: any) => {
    const socket: Socket = io(REACT_APP_WS_API_URL, {
      reconnection: true,
      transports: ['websocket', 'polling'],
    })
    // const toast = useToast()
    const [roomData, setRoomData] = useState<TRoomData>({})
    const [isLogged, setIsLogged] = useState<boolean>(false)
    const [isConnected, setIsConnected] = useState<boolean>(true)

    useEffect(() => {
      const disconnListener = () => {
        // toast({
        //     position: "top",
        //     // title: 'Connection lost...',
        //     description: 'Connection lost...',
        //     status: "error",
        //     duration: 5000,
        //     isClosable: true,
        // })
        setIsConnected(false)
      }
      const oldChatListener = (data: { roomData: TRoomData }) => {
        setRoomData(data.roomData)
      }
      const connListener = () => {
        setIsConnected(true)
      }
      const connErrListener = (reason: any) => {
        console.log(reason)
      }

      socket.on('oldChat', oldChatListener)
      socket.on('disconnect', disconnListener)
      socket.on('connect', connListener)
      socket.on('connect_error', connErrListener)

      return () => {
        socket.off('oldChat', oldChatListener)
        socket.off('disconnect', disconnListener)
        socket.off('connect', connListener)
        socket.off('connect_error', connErrListener)
      }
    }, [socket, setRoomData, setIsConnected])

    return (
      <SocketContext.Provider value={{
        socket, roomData, isLogged, setIsLogged, isConnected, setIsConnected,
      }}>
        {children}
      </SocketContext.Provider>
    )
  }

export const useSocketContext = () => useContext(SocketContext)
