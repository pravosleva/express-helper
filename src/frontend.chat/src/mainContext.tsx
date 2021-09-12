import { useState, createContext } from 'react'

type TMainContext = {
    name: string
    room: string
    setName: (name: string) => void,
    setRoom: (room: string) => void,
}

const MainContext = createContext<TMainContext>({
    name: '',
    room: '',
    setName: (name: string) => {
        throw new Error('setName should be implemented')
    },
    setRoom: (room: string) => {
        throw new Error('setRoom should be implemented')
    },
})

const MainProvider = ({ children }: any) => {
    const [name, setName] = useState<string>('')
    const [room, setRoom] = useState<string>('')  

    return (
        <>
            
            <MainContext.Provider
                value={{
                    name,
                    room,
                    setName,
                    setRoom,
                }}
            >
                {children}
            </MainContext.Provider>
        </>
    )
}

export { MainContext, MainProvider }
