import React, { useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { MainContext } from '~/mainContext'
import { SocketContext } from '~/socketContext'
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  Menu,
  Button,
  MenuButton,
  MenuList,
  MenuItem,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  FormControl,
  Input,
  ModalFooter,
} from '@chakra-ui/react'
import { FiList } from 'react-icons/fi'
import { BiMessageDetail, BiLogOutCircle } from 'react-icons/bi'
import { RiSendPlaneFill, RiEdit2Fill } from 'react-icons/ri'
// @ts-ignore
import ScrollToBottom from 'react-scroll-to-bottom'
import { useToast, UseToastOptions } from '@chakra-ui/react'
import clsx from 'clsx'
import './Chat.scss'
import { UsersContext } from '~/usersContext'
import { useTextCounter } from '~/common/hooks/useTextCounter'
import { getNormalizedDateTime } from '~/utils/timeConverter'
import { useDisclosure } from '@chakra-ui/react'
import { ContextMenu, MenuItem as CtxMenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { ColorModeSwitcher } from '~/common/components/ColorModeSwitcher'

type TUser = { socketId: string; room: string; name: string }
type TMessage = { user: string; text: string; ts: number; editTs?: number }

export const Chat = () => {
  const { name, slugifiedRoom: room, isAdmin } = useContext(MainContext)
  // @ts-ignore
  const { socket, roomData, setIsLogged, isLogged, isConnected, setIsConnected } = useContext(SocketContext)
  const [message, setMessage] = useState('')
  const resetMessage = () => {
    setMessage('')
  }
  const [messages, setMessages] = useState<TMessage[]>([])
  // @ts-ignore
  const { users } = useContext(UsersContext)
  const history = useHistory()
  const toast = useToast()
  const [left, isMsgLimitReached] = useTextCounter({ text: message, limit: 800 })

  useEffect(() => {
    const tsSortDEC = (e1: TMessage, e2: TMessage) => e1.ts - e2.ts
    const messages: TMessage[] = Object.keys(roomData).reduce((acc, name) => {
      // @ts-ignore
      roomData[name].forEach(({ text, ts, ...rest }: any) => {
        // @ts-ignore
        acc.push({ text, user: name, ts, ...rest })
      })
      return acc
    }, [])

    setMessages(messages.sort(tsSortDEC))
  }, [roomData])

  const handleLogout = () => {
    // setName('');
    if (!!socket) socket.emit('logout', { name })
    // setIsLogged(false)
    // setRoom('')
    // history.push('/')
    setTimeout(() => {
      // history.go(0)
      history.push('/')
    }, 0)
  }
  // const textFieldRef = useRef<HTMLInputElement>(null)
  const textFieldRef = useRef<HTMLTextAreaElement>(null)

  // window.onpopstate = e => handleLogout()
  //Checks to see if there's a user present
  // useEffect(() => {
  //     if (!isLogged) history.push('/')
  // }, [isLogged])

  useEffect(() => {
    if (!!socket) {
      const msgListener = (msg: TMessage) => {
        // @ts-ignore
        setMessages((messages: TMessage[]) => [...messages, msg])
      }
      const notifListener = (notif: {
        status: UseToastOptions['status']
        title: string
        description: string
        _originalEvent?: any
      }) => {
        if (!!notif?._originalEvent) {
          console.log('-- notif._originalEvent')
          console.log(notif._originalEvent)
        }
        toast({
          position: 'top',
          title: notif?.title,
          description: notif?.description,
          status: notif?.status || 'info',
          duration: 7000,
          isClosable: true,
        })
      }

      socket.on('message', msgListener)
      socket.on('notification', notifListener)

      return () => {
        socket.off('message', msgListener)
        socket.off('notification', notifListener)
      }
    }
  }, [socket, toast])

  useEffect(() => {
    if (!!socket && !!name && !!room) {
      socket.emit('setMeAgain', { name, room }, (err?: string) => {
        if (!!err) {
          toast({ title: err, status: 'error', duration: 5000, isClosable: true })
          history.push('/')
        }
      })

      return () => {
        socket.emit('unsetMe', { name, room })
      }
    }
  }, [socket, toast, name, room, history])

  useEffect(() => {
    console.log('EFFECT: socket?.connected', socket?.connected)
    if (!!socket) {
      if (!!socket?.connected) {
        socket.emit('setMeAgain', { name, room }, (err?: string) => {
          if (!!err) {
            toast({ title: err, status: 'error' })
            history.push('/')
          }
        })
      } else {
        socket.emit('unsetMe', { name, room })
      }
    }
  }, [socket?.connected, room])

  const handleSendMessage = () => {
    if (isMsgLimitReached) {
      toast({
        position: 'top',
        title: 'Sorry',
        description: 'Cant send big msg',
        status: 'error',
        duration: 7000,
        isClosable: true,
      })
      return
    }
    const normalizedMsg = message.replace(/\s+/g, ' ').trim()
    if (!!socket && !!normalizedMsg) {
      socket.emit('sendMessage', { message: normalizedMsg, userName: name })
      resetMessage()
    }
  }
  const handleKeyUp = (ev: any) => {
    switch (true) {
      case ev.keyCode === 13 && !ev.shiftKey:
        if (!!message) handleSendMessage()
        break
      default:
        break
    }
  }
  const handleChange = (ev: any) => {
    setMessage(ev.target.value)
  }
  const hasUserInMessage = useCallback(
    (user: TUser) => {
      let result = false
      const template = `@${user.name}`

      if (message.includes(template)) result = true

      return result
    },
    [message]
  )
  const handleUserClick = (user: TUser) => {
    if (!hasUserInMessage(user)) {
      setMessage(`@${user.name}, ${message}`)
    }
    if (!!textFieldRef.current) textFieldRef.current.focus()
  }

  useEffect(() => {
    if (!room || !name) {
      history.push('/')
    }
  }, [])

  const { isOpen: isEditModalOpen, onOpen: handleEditModalOpen, onClose: handleEditModalClose } = useDisclosure()
  const [editedMessage, setEditedMessage] = useState<{ text: string; ts: number }>({ text: '', ts: 0 })
  const initialRef = useRef(null)
  const handleChangeEditedMessage = (e: any) => {
    setEditedMessage((state) => ({ ...state, text: e.target.value }))
  }
  const handleSaveEditedMessage = () => {
    if (!editedMessage?.text) {
      toast({
        position: 'top',
        // title: 'Sorry',
        description: 'Should not be empty',
        status: 'error',
        duration: 3000,
      })
      return
    }
    if (!!socket)
      socket.emit(
        'editMessage',
        { newMessage: editedMessage.text, ts: editedMessage.ts, room, name },
        (errMsg: string) => {
          if (!!errMsg) {
            toast({
              position: 'top',
              // title: 'Sorry',
              description: errMsg,
              status: 'error',
              duration: 7000,
              isClosable: true,
            })
          } else {
            console.log('CLOSE')
          }
        }
      )
    handleEditModalClose()
  }
  const handleKeyDownEditedMessage = (ev: any) => {
    if (ev.keyCode === 13) {
      if (!!room) handleSaveEditedMessage()
    }
  }
  const handleDeleteMessage = (ts: number) => {
    if (!!socket)
      socket.emit('deleteMessage', { ts: editedMessage.ts, room, name }, (errMsg: string) => {
        if (!!errMsg) {
          toast({
            position: 'top',
            // title: 'Sorry',
            description: errMsg,
            status: 'error',
            duration: 7000,
            isClosable: true,
          })
        }
      })
  }

  return (
    <>
      <ContextMenu id="same_unique_identifier">
        <CtxMenuItem data={{ foo: 'bar' }} onClick={handleEditModalOpen}>
          Edit
        </CtxMenuItem>
        <CtxMenuItem data={{ foo: 'bar' }} onClick={handleDeleteMessage}>
          Delete
        </CtxMenuItem>
      </ContextMenu>
      <Modal
        size="xs"
        initialFocusRef={initialRef}
        finalFocusRef={textFieldRef}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit your msg</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* <FormControl>
                        <FormLabel>ts</FormLabel>
                        <Input
                            placeholder="ts"
                            value={editedMessage.ts}
                            isDisabled
                        />
                    </FormControl> */}
            <FormControl mt={4}>
              <FormLabel>Text</FormLabel>
              <Textarea
                isInvalid={!editedMessage?.text}
                resize="none"
                placeholder="Message"
                ref={initialRef}
                onKeyDown={handleKeyDownEditedMessage}
                value={editedMessage.text}
                onChange={handleChangeEditedMessage}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveEditedMessage}>
              Save
            </Button>
            <Button onClick={handleEditModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Flex
          className="room"
          flexDirection="column"
          width={{ base: '100%', sm: '450px', md: '550px' }}
          height={{ base: '100%', sm: 'auto' }}
        >
          <Heading className="heading" as="h4" p="1rem 1.5rem" borderRadius="10px 10px 0 0">
            <Flex alignItems="center" justifyContent="space-between">
              <Menu>
                <div>
                  <MenuButton as={IconButton} icon={<FiList />} isRound="true" />
                  <ColorModeSwitcher justifySelf="flex-end" mr={2} />
                </div>
                <MenuList
                  _dark={{ bg: "gray.600" }}
                  // _hover={{ bg: "gray.500", color: 'white' }}
                  // _expanded={{ bg: "gray.800" }}
                  // _focus={{ boxShadow: "outline" }}
                >
                  {users &&
                    users.map((user: TUser) => {
                      return (
                        <MenuItem
                          // _first={{ bg: "gray.200" }}
                          _hover={{ bg: "gray.400", color: 'white' }}
                          _focus={{ bg: "gray.400", color: 'white' }}
                          minH="40px"
                          key={user.name}
                          onClick={() => {
                            handleUserClick(user)
                          }}
                          isDisabled={name === user.name}
                        >
                          <Text fontSize="sm">{user.name}</Text>
                        </MenuItem>
                      )
                    })}
                  {isAdmin && (
                    <MenuItem
                      _hover={{ bg: "gray.400", color: 'white' }}
                      _focus={{ bg: "gray.400", color: 'white' }}
                      minH="40px"
                      key="adm-btm"
                      onClick={() => {
                        history.push('/admin')
                      }}
                    >
                      <Text fontSize="sm">Admin panel</Text>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
              <Flex alignItems="center" flexDirection="column" flex={{ base: '1', sm: 'auto' }}>
                <Heading fontSize="lg"> {room.slice(0, 1).toUpperCase() + room.slice(1)}</Heading>
                <Flex alignItems="center">
                  <Text mr="1" fontWeight="400" fontSize="md" opacity=".7" letterSpacing="0">
                    {name}
                  </Text>
                  <Box h={2} w={2} borderRadius="100px" bg={isConnected ? 'green.300' : 'red.300'}></Box>
                </Flex>
              </Flex>
              <Button fontSize="sm" onClick={handleLogout} variant='outline'>
                {isConnected ? 'Logout' : 'Reconnect'}
              </Button>
            </Flex>
          </Heading>

          <ScrollToBottom className="messages" debug={false}>
            {messages.length > 0 ? (
              messages.map(({ user, text, ts, editTs }: TMessage, i) => {
                const isMyMessage = user === name
                const date = getNormalizedDateTime(ts)
                const editDate = !!editTs ? getNormalizedDateTime(editTs) : null

                return (
                  <Box
                    key={`${user}-${ts}-${editTs || ''}`}
                    className={clsx('message', { 'my-message': isMyMessage, 'oponent-message': !isMyMessage })}
                    m=".2rem 0"
                  >
                    <Text fontSize="xs" opacity=".8" ml="5px" className="from">
                      <b>{user}</b>{' '}
                      <span className="date">
                        {date}
                        {!!editDate && <b> Edited</b>}
                      </span>
                    </Text>
                    {isMyMessage ? (
                      <ContextMenuTrigger id="same_unique_identifier">
                        <Text
                          fontSize="sm"
                          className="msg"
                          p=".4rem .8rem"
                          bg="white"
                          color="white"
                          onContextMenu={() => {
                            setEditedMessage({ ts, text })
                          }}
                        >
                          {text}
                          {/* <div className='abs-edit-btn'><RiEdit2Fill /></div> */}
                        </Text>
                      </ContextMenuTrigger>
                    ) : (
                      <Text fontSize="sm" className="msg" p=".4rem .8rem" bg="white" color="white">
                        {text}
                      </Text>
                    )}
                  </Box>
                )
              })
            ) : (
              <Flex alignItems="center" justifyContent="center" mt=".5rem" opacity=".2" w="100%">
                <Box mr="2">-----</Box>
                <BiMessageDetail fontSize="1rem" />
                <Text ml="1" fontWeight="400">
                  No messages
                </Text>
                <Box ml="2">-----</Box>
              </Flex>
            )}
          </ScrollToBottom>
          <div className="form">
            {/* <input ref={textFieldRef} type="text" placeholder='Enter Message' value={message} onChange={handleChange} onKeyDown={handleKeyDown} /> */}
            <Textarea
              id="msg"
              isInvalid={isMsgLimitReached}
              resize="none"
              ref={textFieldRef}
              placeholder="Enter Message"
              value={message}
              onChange={handleChange}
              onKeyUp={handleKeyUp}
            />
            <label htmlFor="msg" className='absolute-label'>{left} left</label>
            <IconButton
              aria-label="Send"
              // colorScheme={isMsgLimitReached ? 'red' : 'gray'}
              isRound
              icon={<RiSendPlaneFill />}
              onClick={handleSendMessage}
              disabled={!message}
            >
              Send
            </IconButton>
          </div>
        </Flex>
      </div>
    </>
  )
}
