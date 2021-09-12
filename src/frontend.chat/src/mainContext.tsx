import { useState, createContext, useEffect, useRef, useCallback } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
} from "@chakra-ui/react"
import { useLocalStorage } from 'react-use'

type TMainContext = {
    name: string
    room: string
    setName: (name: string) => void,
    setNameLS: (name: string) => void,
    setRoom: (room: string) => void,
}

const MainContext = createContext<TMainContext>({
    name: '',
    room: '',
    setName: (name: string) => {
        throw new Error('setName should be implemented')
    },
    setNameLS: (name: string) => {
        throw new Error('setNameLS should be implemented')
    },
    setRoom: (room: string) => {
        throw new Error('setRoom should be implemented')
    },
})

const MainProvider = ({ children }: any) => {
    const [nameLS, setNameLS, removeNameLS] = useLocalStorage<string>('chat.my-name', '')
    const [name, setName] = useState<string>('')
    const [room, setRoom] = useState<string>('')
    const [isModalOpened, setIsModalOpened] = useState<boolean>(false)
    const handleOpenModal = useCallback(() => {
        setIsModalOpened(true)
    }, [setIsModalOpened])
    const handleCloseModal = useCallback(() => {
        setIsModalOpened(false)
    }, [setIsModalOpened])

    const nameLSRef = useRef<string>(nameLS || '')
    const handleClearName = () => {
        setName('')
        nameLSRef.current = ''
        removeNameLS()
        handleCloseModal()
    }
    const countRef = useRef(0)
 
    useEffect(() => {
        if (countRef.current === 0) {
            if (!!nameLSRef.current) {
                setName(nameLSRef.current)
                handleOpenModal()
            }
        } else {
            countRef.current += 1
        }
    }, [handleOpenModal, setName, nameLS])

    return (
        <>
            <Modal isOpen={isModalOpened} onClose={handleCloseModal}>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>Your name is</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {nameLS}
                </ModalBody>
        
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClearName}>
                        No
                    </Button>
                    <Button
                        autoFocus
                        colorScheme="blue"
                        onClick={() => {
                            setName(nameLSRef.current)
                            handleCloseModal()
                        }}
                    >
                        Yes
                    </Button>
                </ModalFooter>
                </ModalContent>
            </Modal>
            <MainContext.Provider
                value={{
                    name,
                    room,
                    setName,
                    setNameLS,
                    setRoom,
                }}
            >
                {children}
            </MainContext.Provider>
        </>
    )
}

export { MainContext, MainProvider }
