import { useState, createContext } from 'react'

const MainContext = createContext({})

const MainProvider = ({ children }: any) => {
    const [name, setName] = useState('')
    const [room, setRoom] = useState('')

    return (
        <MainContext.Provider value={{ name, room, setName, setRoom }}>
            {children}
        </MainContext.Provider>
    )
}

export { MainContext, MainProvider } 