import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { MainContext } from '../../mainContext'
import { SocketContext } from '../../socketContext'
import { Box, Flex, Heading, IconButton, Text, Menu, Button, MenuButton, MenuList, MenuItem, Textarea } from "@chakra-ui/react"
import { FiList } from 'react-icons/fi'
import { BiMessageDetail } from 'react-icons/bi'
import { RiSendPlaneFill } from 'react-icons/ri'
// @ts-ignore
import ScrollToBottom from 'react-scroll-to-bottom';
import { useToast, UseToastOptions } from "@chakra-ui/react"
import './Chat.scss'
import { UsersContext } from '../../usersContext'
import { useTextCounter } from '../../hooks/useTextCounter'

type TUser = { socketId: string, room: string, name: string }

export const Chat = () => {
    const { name, room } = useContext(MainContext)
    // @ts-ignore
    const { socket } = useContext(SocketContext)
    const [message, setMessage] = useState('')
    const resetMessage = () => {
        setMessage('')
    }
    const [messages, setMessages] = useState([])
    // @ts-ignore
    const { users } = useContext(UsersContext)
    const history = useHistory()
    const toast = useToast()
    const [left, isMsgLimitReached] = useTextCounter({ text: message, limit: 800 })

    const handleLogout = () => {
        // setName('');
        // setRoom('');
        history.push('/')
        history.go(0)
    }
    // const textFieldRef = useRef<HTMLInputElement>(null)
    const textFieldRef = useRef<HTMLTextAreaElement>(null)

    window.onpopstate = e => handleLogout()
    //Checks to see if there's a user present
    useEffect(() => { if (!name) return history.push('/') }, [history, name])

    useEffect(() => {
        if (!!socket) {
            const msgListener = (msg: string) => {
                // @ts-ignore
                setMessages((messages: string[]) => [...messages, msg]);
            }
            const notifListener = (notif: { status: UseToastOptions["status"], title: string, description: string }) => {
                toast({
                    position: "top",
                    title: notif?.title,
                    description: notif?.description,
                    status: notif?.status || "info",
                    duration: 7000,
                    isClosable: true,
                })
            }
    
            socket.on("message", msgListener)
            socket.on("notification", notifListener)
    
            return () => {
                socket.off("message", msgListener)
                socket.off("notification", notifListener)
            }
        }
    }, [socket, toast])

    const handleSendMessage = () => {
        if (isMsgLimitReached) {
            toast({
                position: "top",
                title: 'Sorry',
                description: 'Cant send big msg',
                status: "error",
                duration: 7000,
                isClosable: true,
            })
            return
        }
        const normalizedMsg = message.trim()
        if (!!socket && !!normalizedMsg) {
            socket.emit('sendMessage', normalizedMsg)
            resetMessage()
        }
    }
    const handleKeyUp = (ev: any) => {
        switch (true) {
            case ev.keyCode === 13 && !ev.shiftKey:
                if (!!message) handleSendMessage()
                break;
            default:
                break;
        }
    }
    const handleChange = (ev: any) => {
        setMessage(ev.target.value)
    }
    const hasUserInMessage = useCallback((user: TUser) => {
        let result = false
        const template = `@${user.name}`

        if (message.includes(template)) result = true

        return result
    }, [message])
    const handleUserClick = (user: TUser) => {
        if (!hasUserInMessage(user)) {
            setMessage(`@${user.name}, ${message}`)
        }
        if (!!textFieldRef.current) textFieldRef.current.focus()
    }

    return (
        <Flex className='room' flexDirection='column' width={{ base: "100%", sm: '575px' }} height={{ base: "100%", sm: "auto" }}>
            <Heading className='heading' as='h4' bg='white' p='1rem 1.5rem' borderRadius='10px 10px 0 0'>
                <Flex alignItems='center' justifyContent='space-between'>
                    <Menu >
                        <MenuButton as={IconButton} icon={<FiList />} isRound='true' bg='blue.300' color='white' />
                        <MenuList>
                            {
                                users && users.map((user: TUser) => {
                                    return (
                                        <MenuItem
                                            minH='40px'
                                            key={user.name}
                                            onClick={() => {
                                                handleUserClick(user)
                                            }}
                                            isDisabled={name === user.name}
                                        >
                                            <Text fontSize='sm'>{user.name}</Text>
                                        </MenuItem>
                                    )
                                })
                            }
                        </MenuList>
                    </Menu>
                    <Flex alignItems='center' flexDirection='column' flex={{ base: "1", sm: "auto" }}>
                        <Heading fontSize='lg'> {room.slice(0, 1).toUpperCase() + room.slice(1)}</Heading>
                        <Flex alignItems='center'><Text mr='1' fontWeight='400' fontSize='md' opacity='.7' letterSpacing='0' >{name}</Text><Box h={2} w={2} borderRadius='100px' bg='green.300'></Box></Flex>
                    </Flex>
                    <Button color='gray.500' fontSize='sm' onClick={handleLogout}>Logout</Button>
                </Flex>
            </Heading>


            <ScrollToBottom className='messages' debug={false}>
                {messages.length > 0 ?
                    messages.map((msg: any, i) =>
                    (<Box key={i} className={`message ${msg.user === name ? "my-message" : ""}`} m=".2rem 0">
                        <Text fontSize='xs' opacity='.7' ml='5px' className='user'>{msg.user}</Text>
                        <Text fontSize='sm' className='msg' p=".4rem .8rem" bg='white' borderRadius='15px' color='white'>{msg.text}</Text>
                    </Box>)
                    )
                    :
                    <Flex alignItems='center' justifyContent='center' mt='.5rem' bg='#EAEAEA' opacity='.2' w='100%'>
                        <Box mr='2'>-----</Box>
                        <BiMessageDetail fontSize='1rem' />
                        <Text ml='1' fontWeight='400'>No messages</Text>
                        <Box ml='2'>-----</Box>
                    </Flex>
                }
            </ScrollToBottom>
            <div className='form'>
                {/* <input ref={textFieldRef} type="text" placeholder='Enter Message' value={message} onChange={handleChange} onKeyDown={handleKeyDown} /> */}
                <Textarea id='msg' isInvalid={isMsgLimitReached} resize='none' ref={textFieldRef} placeholder='Enter Message' value={message} onChange={handleChange} onKeyUp={handleKeyUp} />
                <label htmlFor='msg'>{left} left</label>
                <IconButton aria-label='Users' colorScheme={isMsgLimitReached ? 'red' : 'blue'} isRound icon={<RiSendPlaneFill />} onClick={handleSendMessage} disabled={!message}>Send</IconButton>
            </div>
        </Flex>
    )
}
