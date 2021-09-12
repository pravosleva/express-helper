import { createContext } from 'react'
import io, { Socket } from 'socket.io-client'

const REACT_APP_WS_API_URL = process.env.REACT_APP_WS_API_URL || '/'

interface ISocketContext {
    socket: Socket | null
  }

const SocketContext = createContext<ISocketContext>({
    socket: null
})

const SocketProvider = ({ children }: any) => {
    const socket: Socket = io(REACT_APP_WS_API_URL, { transports: ['websocket', 'polling'] })

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}

export { SocketContext, SocketProvider }