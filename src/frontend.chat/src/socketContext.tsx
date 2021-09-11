import { createContext } from 'react'
import io from 'socket.io-client'

const REACT_APP_WS_API_URL = process.env.REACT_APP_WS_API_URL || '/'

const SocketContext = createContext({})

const SocketProvider = ({ children }: any) => {
    console.log(REACT_APP_WS_API_URL)
    const socket = io(REACT_APP_WS_API_URL, { transports: ['websocket', 'polling'] })
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export { SocketContext, SocketProvider }