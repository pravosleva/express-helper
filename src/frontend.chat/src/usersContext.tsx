import { useState, createContext, useContext, useEffect } from 'react'
import { SocketContext } from './socketContext'

const UsersContext = createContext({})

const UsersProvider = ({ children }: any) => {
    const [users, setUsers] = useState<{ name: string }[]>([])
    const { socket } = useContext(SocketContext)

    useEffect(() => {
        if (!!socket) {
            const sUListener = (users: any[]) => {
                console.log(users)
                setUsers(users)
            }
            socket.on("users", sUListener)
    
            return () => {
                socket.off("users", sUListener)
            }
        }
    }, [setUsers])

    return (
        <UsersContext.Provider value={{ users, setUsers }}>
            {children}
        </UsersContext.Provider>
    )
}

export { UsersContext, UsersProvider } 