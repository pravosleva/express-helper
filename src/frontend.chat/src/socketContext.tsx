import { createContext, useEffect, useState, memo } from 'react'
import io, { Socket } from 'socket.io-client'
import { useToast } from "@chakra-ui/react"

const REACT_APP_WS_API_URL = process.env.REACT_APP_WS_API_URL || '/'

type TMessage = {
    text: string
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
}

const SocketContext = createContext<ISocketContext>({
    socket: null,
    roomData: {},
    isLogged: false,
    setIsLogged: () => {}
})


const SocketProvider = memo(({ children }: any) => {
    const socket: Socket = io(REACT_APP_WS_API_URL, {
        reconnection: true,
        transports: ['websocket', 'polling'],
    })
    const toast = useToast()
    const [roomData, setRoomData] = useState<TRoomData>({})
    const [isLogged, setIsLogged] = useState<boolean>(false)

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
        const oldChatListener = (data: { roomData: TRoomData }) => {
            console.log(data.roomData)
            setRoomData(data.roomData)
        }

        socket.on("oldChat", oldChatListener)
        socket.on('disconnect', disconnListener)

        return () => {
            socket.off("oldChat", oldChatListener)
            socket.off('disconnect', disconnListener)
        }
    }, [socket, setRoomData])

    return (
        <SocketContext.Provider value={{ socket, roomData, isLogged, setIsLogged }}>
            {children}
        </SocketContext.Provider>
    )
}, () => true)

export { SocketContext, SocketProvider }