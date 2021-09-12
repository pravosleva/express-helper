import React, { useContext, useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { MainContext } from '../../mainContext'
import { SocketContext } from '../../socketContext'
import { Flex, Heading, IconButton, Input } from "@chakra-ui/react"
import { RiArrowRightLine } from "react-icons/ri"
import { useToast } from "@chakra-ui/react"

export const Login = () => {
    const socket = useContext(SocketContext)
    const { name, setName, setNameLS, room, setRoom } = useContext(MainContext)
    const history = useHistory()
    const toast = useToast()
    const location = useLocation()
    const [isRoomDisabled, setIsRoomDisabled] = useState(false)

    //Checks to see if there's a user already present
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)

        if(!!queryParams.has('room')) {
          const openRoomName = queryParams.get('room')

          setRoom(openRoomName)
          setIsRoomDisabled(true)
    
          queryParams.delete('room')
          history.replace({ search: queryParams.toString() })
        }
      }, [location.search, history, setRoom])

    //Emits the login event and if successful redirects to chat and saves user data
    const handleClick = () => {
        setNameLS(name)
        socket.emit('login', { name, room }, error => {
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

    const handleKeyDown = (ev) => {
        if (ev.keyCode === 13) {
            if (!!room) handleClick()
        }
    }

    return (
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
    )
}
