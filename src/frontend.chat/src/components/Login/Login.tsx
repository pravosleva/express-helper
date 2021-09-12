import React, { useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { MainContext } from '../../mainContext'
import { SocketContext } from '../../socketContext'
import { Flex, Heading, IconButton, Input } from "@chakra-ui/react"
import { RiArrowRightLine } from "react-icons/ri"
import { useToast } from "@chakra-ui/react"

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

export const Login = () => {
    const { socket } = useContext(SocketContext)
    const { name, setName, room, setRoom } = useContext(MainContext)
    const history = useHistory()
    const toast = useToast()
    const location = useLocation()
    const [isRoomDisabled, setIsRoomDisabled] = useState(false)

    // --- LS
    const [nameLS, setNameLS, removeNameLS] = useLocalStorage<string>('chat.my-name', '')
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
    // ---

    //Checks to see if there's a user already present
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const openRoomName: string | null = queryParams.get('room')

        if(!!openRoomName) {
          setRoom(openRoomName)
          setIsRoomDisabled(true)
    
          queryParams.delete('room')
          history.replace({ search: queryParams.toString() })
        }
      }, [location.search, history, setRoom])

    //Emits the login event and if successful redirects to chat and saves user data
    const handleClick = () => {
        setNameLS(name)
        if (!!socket) socket.emit('login', { name, room }, (error: any) => {
            if (error) {
                console.log(error)
                return toast({
                    position: "top",
                    title: "Error",
                    description: error,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                })
            }
            history.push('/chat')
            return toast({
                position: "top",
                title: "Hey there",
                description: `Welcome to ${room}`,
                status: "success",
                duration: 5000,
                isClosable: true,
            })
        })
    }

    const handleKeyDown = (ev: any) => {
        if (ev.keyCode === 13) {
            if (!!room) handleClick()
        }
    }

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
            <Flex className='login' flexDirection='column' mb='8'>
                <Heading as="h1" size="3xl" textAlign='center' mb='8' fontFamily='DM Sans' fontWeight='600' letterSpacing='-2px'>Let's talk</Heading>
                <Flex className="form" gap='1rem' flexDirection={{ base: "column", md: "row" }}>
                    <Input
                        autoFocus
                        variant='filled'
                        mr={{ base: "0", md: "4" }}
                        mb={{ base: "4", md: "0" }}
                        type="text"
                        placeholder='User Name'
                        value={name}
                        onChange={e => {
                            setName(e.target.value)
                        }}
                    />
                    <Input
                        disabled={isRoomDisabled}
                        variant='filled'
                        mr={{ base: "0", md: "4" }}
                        mb={{ base: "4", md: "0" }}
                        type="text"
                        placeholder='Room Name'
                        value={room}
                        onChange={e => {
                            setRoom(e.target.value)
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <IconButton colorScheme='blue' isRound aria-label="icon-btn" icon={<RiArrowRightLine />} onClick={handleClick}></IconButton>
                </Flex>
            </Flex>
        </>
    )
}