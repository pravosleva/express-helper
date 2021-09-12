import { createContext, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'
import { useToast } from "@chakra-ui/react"

const REACT_APP_WS_API_URL = process.env.REACT_APP_WS_API_URL || '/'

interface ISocketContext {
    socket: Socket | null
  }

const SocketContext = createContext<ISocketContext>({
    socket: null
})

const SocketProvider = ({ children }: any) => {
    const socket: Socket = io(REACT_APP_WS_API_URL, { transports: ['websocket', 'polling'] })
    const toast = useToast()

    useEffect(() => {
        const disconnListener = () => {
            toast({
                position: "top",
                // title: 'Connection lost...',
                description: 'Connection lost...',
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        }

        socket.on('disconnect', disconnListener)

        return () => {
            socket.off('disconnect', disconnListener)
        }
    }, [])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}

export { SocketContext, SocketProvider }