import { useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { MainContext } from '~/mainContext'
import { useSocketContext } from '~/socketContext'
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
  // Input,
  ModalFooter,
  MenuOptionGroup,
  // MenuItemOption,
  MenuDivider,

  useDisclosure,
  // useBreakpointValue,
  useMediaQuery,
  Progress,
  Spinner,
} from '@chakra-ui/react'
import { FiList } from 'react-icons/fi'
import { BiMessageDetail } from 'react-icons/bi'
import { RiSendPlaneFill } from 'react-icons/ri'
// @ts-ignore
import ScrollToBottom from 'react-scroll-to-bottom'
import { useToast, UseToastOptions } from '@chakra-ui/react'
import clsx from 'clsx'
import './Chat.scss'
import { UsersContext } from '~/usersContext'
import { useTextCounter } from '~/common/hooks/useTextCounter'
import { getNormalizedDateTime, getNormalizedDateTime2 } from '~/utils/timeConverter'
import { ContextMenu, MenuItem as CtxMenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { ColorModeSwitcher } from '~/common/components/ColorModeSwitcher'
import { SetPasswordModal } from './components/SetPasswordModal'
import { MyInfoModal } from './components/MyInfoModal'
import { TasklistModal } from './components/TasklistModal/TasklistModal'
import { xs, sm, md, lg, xl } from '~/common/chakra/theme'
import { IoMdLogOut } from 'react-icons/io'
import { useLocalStorage } from 'react-use'
// import merge2 from 'deepmerge'
import { binarySearchTsIndex } from '~/utils/sort/binarySearch'
import { useInView } from 'react-intersection-observer'
// import { useSpring, animated } from 'react-spring'

enum EMessageType {
  Info = 'info',
  Success = 'success',
  Warn = 'warning',
  Danger = 'danger'
}

// @ts-ignore
// const overwriteMerge = (destinationArray, sourceArray, _options) => [, ...sourceArray]
const tsSortDEC = (e1: TMessage, e2: TMessage) => e1.ts - e2.ts

type TUser = { socketId: string; room: string; name: string }
type TMessage = { user: string; text: string; ts: number; editTs?: number; name: string, type: EMessageType }

export const Chat = () => {
  const { name, slugifiedRoom: room, isAdmin } = useContext(MainContext)
  // @ts-ignore
  const { socket, roomData, isConnected } = useSocketContext()
  const [message, setMessage] = useState('')
  const resetMessage = () => {
    setMessage('')
  }
  const [messages, setMessages] = useState<TMessage[]>([])
  // @ts-ignore
  const { users, tasklist } = useContext(UsersContext)
  const history = useHistory()
  const toast = useToast()
  const [left, isMsgLimitReached] = useTextCounter({ text: message, limit: 800 })
  // const [controlTs, setControlTs] = useState<number>(Date.now())

  // useEffect(() => {
  //   const tsSortDEC = (e1: TMessage, e2: TMessage) => e1.ts - e2.ts
  //   const messages: TMessage[] = Object.keys(roomData).reduce((acc, name) => {
  //     // @ts-ignore
  //     roomData[name].forEach(({ text, ts, ...rest }: any) => {
  //       // @ts-ignore
  //       acc.push({ text, user: name, ts, ...rest })
  //     })
  //     return acc
  //   }, [])

  //   setMessages(messages.sort(tsSortDEC))
  // }, [roomData])

  // useEffect(() => {
  //   setMessages(roomData)
  // }, [roomData])

  const [tokenLS] = useLocalStorage<any>('chat.token')
  const handleLogout = () => {
    // setName('');
    if (!!socket) socket.emit('logout', { name, token: String(tokenLS) })
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

  const [regData, setRegData] = useState<any>(null)
  const [tsPoint, setTsPoint] = useState<number | null>(Date.now())
  const [fullChatReceived, setFullChatReceived] = useState<boolean>(false)
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false)

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
      const myUserDataListener = (regData: any) => {
        setRegData(regData)
      }
      const logoutFromServerListener = () => {
        history.push('/')
      }
      const partialOldChatListener = ({ result, nextTsPoint, isDone  }: { result: TMessage[], nextTsPoint: number, isDone: boolean }) => {
        setMessages((ms: TMessage[]) => {
          const key = 'ts'
          const arrayUniqueByKey = [...new Map([...result, ...ms].map((item: TMessage) =>
          [item[key], item])).values()]

          return arrayUniqueByKey.sort(tsSortDEC)
        })
        setTsPoint(nextTsPoint)
        setFullChatReceived(isDone)
      }
      const updMsgListener = ({ text, ts, editTs, type }: { text: string, editTs?: number, type?: EMessageType, ts: number }) => {
        setMessages((ms: TMessage[]) => {
          const newArr = [...ms]
          const targetIndex = binarySearchTsIndex({ messages: ms, targetTs: ts })
          
          if (targetIndex !== -1) {
            newArr[targetIndex].text = text
            if (!!editTs) newArr[targetIndex].editTs = editTs
            if (!!type) {
              newArr[targetIndex].type = type
            } else {
              // @ts-ignore
              if (!!newArr[targetIndex].type) delete newArr[targetIndex].type
            }
          }
          return newArr
        })
      }
      const delMsgListener = ({ ts }: { ts: number }) => {
        setMessages((ms: TMessage[]) => {
          const newArr = [...ms]
          const targetIndex = binarySearchTsIndex({ messages: ms, targetTs: ts })
          
          if (targetIndex !== -1) newArr.splice(targetIndex, 1)
          return newArr
        })
      }

      socket.on('message', msgListener)
      socket.on('message.update', updMsgListener)
      socket.on('message.delete', delMsgListener)
      socket.on('notification', notifListener)
      socket.on('my.user-data', myUserDataListener)
      socket.on('FRONT:LOGOUT', logoutFromServerListener)
      socket.on('partialOldChat', partialOldChatListener)

      return () => {
        socket.off('message', msgListener)
        socket.off('message.update', updMsgListener)
        socket.off('message.delete', delMsgListener)
        socket.off('notification', notifListener)
        socket.off('my.user-data', myUserDataListener)
        socket.off('FRONT:LOGOUT', logoutFromServerListener)
        socket.off('partialOldChat', partialOldChatListener)
      }
    }
  }, [socket, toast])

  // useEffect(() => {
  //   if (!!socket && !!tsPoint) {
  //     setIsChatLoading(true)
  //     setTimeout(() => {
  //       socket.emit('getPartialOldChat', { tsPoint, room })
  //       setIsChatLoading(false)
  //     }, 500)
  //   }
  // }, [tsPoint, room, socket])

  const getPieceOfChat = useCallback(() => {
    if (!!socket && !!tsPoint) {
      setIsChatLoading(true)
      setTimeout(() => {
        socket.emit('getPartialOldChat', { tsPoint, room }, () => {
          setIsChatLoading(false)
        })
      }, 500)
    }
  }, [tsPoint, room, socket])

  useEffect(() => {
    if (!!socket && !!name && !!room) {
      socket.emit('setMeAgain', { name, room, token: String(tokenLS) }, (err?: string) => {
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
        setFullChatReceived(false)
        setTsPoint(Date.now())
      } else {
        socket.emit('unsetMe', { name, room })
      }
    }
  }, [socket?.connected, room, history])

  const [isSending, setIsSending] = useState<boolean>(false)
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
    // const normalizedMsg = message.replace(/\s+/g, ' ').trim()
    const normalizedMsg = message.trim().replace(/\n+/g, '\n')
    if (!!socket && !!normalizedMsg) {
      setIsSending(true)
      socket.emit('sendMessage', { message: normalizedMsg, userName: name }, () => {
        setIsSending(false)
      })
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
    if (!room || !name) history.push('/')
  }, [])

  const { isOpen: isEditModalOpen, onOpen: handleEditModalOpen, onClose: handleEditModalClose } = useDisclosure()
  const [editedMessage, setEditedMessage] = useState<{ text: string; ts: number; type?: EMessageType }>({ text: '', ts: 0 })
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
    if (!!socket) {
      const newData: Partial<TMessage> = { text: editedMessage.text }
      if (!!editedMessage.type) newData.type = editedMessage.type
      socket.emit(
        'editMessage',
        { newData, ts: editedMessage.ts, room, name },
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
          }
        }
      )
    }
    handleEditModalClose()
  }
  // const handleKeyDownEditedMessage = (ev: any) => {
  //   if (ev.keyCode === 13) {
  //     if (!!room) handleSaveEditedMessage()
  //   }
  // }
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
  const handleSetStatus = (type: EMessageType) => {
    if (!!socket) {
      socket.emit(
        'editMessage',
        { newData: { text: editedMessage.text, type }, ts: editedMessage.ts, room, name }
      )
    }
  }
  const handleUnsetStatus = () => {
    if (!!socket) {
      socket.emit(
        'editMessage',
        { newData: { text: editedMessage.text }, ts: editedMessage.ts, room, name }
      )
    }
  }

  // --- Set my password
  const [isSetPasswordModalOpened, setIsSetPasswordModalOpened] = useState<boolean>(false)
  const handleSetPasswordModalOpen = () => {
    setIsSetPasswordModalOpened(true)
  }
  const handleSetPasswordModalClose = () => {
    setIsSetPasswordModalOpened(false)
  }
  // ---
  // --- My info:
  const [isMyInfoModalOpened, setIsMyInfoModalOpened] = useState<boolean>(false)
  const handleMyInfoModalOpen = () => {
    setIsMyInfoModalOpened(true)
  }
  const handleMyInfoModalClose = () => {
    setIsMyInfoModalOpened(false)
  }
  // ---
  // --- Tasklist:
  const [isTasklistModalOpened, setTasklistModalOpened] = useState<boolean>(false)
  const handleTasklistModalOpen = () => {
    setTasklistModalOpened(true)
  }
  const handleTasklistModalClose = () => {
    setTasklistModalOpened(false)
  }
  // ---

  // const heighlLimitParentClass = useBreakpointValue({ md: "height-limited-md", base: "height-limited-sm" })
  const [downToSm] = useMediaQuery(`(max-width: ${md}px)`)
  const [upToSm] = useMediaQuery(`(min-width: ${md + 1}px)`)
  const completedTasksLen = useMemo(() => tasklist.filter(({ isCompleted }: any) => isCompleted).length, [JSON.stringify(tasklist)])
  const percentage = useMemo(() => {
    if (tasklist.length === 0) return 0

    const all = tasklist.length
    const completed = completedTasksLen

    return Math.round(completed * 100 / all)
  }, [tasklist, completedTasksLen])

  const [inViewRef, inView, entry] = useInView({
    /* Optional options */
    threshold: 0,
  })
  useEffect(() => {
    if (inView) getPieceOfChat()
  }, [inView, getPieceOfChat])

  const rendCounter = useRef<number>(0)
  useEffect(() => {
    if (isConnected) rendCounter.current += 1
    const isFirstRender = rendCounter.current === 1
    if (isFirstRender) return
    // setFullChatReceived(false)
    // setTsPoint(Date.now())
    // if (isConnected) getPieceOfChat()
    if (isConnected) {
      // NOTE: При реконнекте нужно обнновить контент - проще всего очистить и начать загружать заново
      setMessages([])
      // toast({
      //   position: 'top',
      //   description: `Connect ${rendCounter.current}`,
      //   status: 'info',
      //   duration: 10000,
      //   isClosable: true,
      // })
    }
  }, [isConnected])

  // const transform = useSpring({
  //   from: {
  //     opacity: 0,
  //     // transform: 'scale(0.95)',
  //     margin: ".2rem 0",
  //     // height: '0',
  //   },
  //   to: {
  //     opacity: 1,
  //     // transform: 'scale(1)',
  //     margin: ".2rem 0",
  //     // height: 'auto',
  //   },
  // })

  return (
    <>
      <TasklistModal
        isOpened={isTasklistModalOpened}
        onClose={handleTasklistModalClose}
        data={tasklist}
      />

      <MyInfoModal
        isOpened={isMyInfoModalOpened}
        onClose={handleMyInfoModalClose}
        data={regData}
      />

      <SetPasswordModal
        isOpened={isSetPasswordModalOpened}
        onClose={handleSetPasswordModalClose}
      />

      <ContextMenu id="same_unique_identifier">
        {
          editedMessage.type !== EMessageType.Info && (
            <CtxMenuItem className={EMessageType.Info} data={{ foo: 'bar' }} onClick={() => handleSetStatus(EMessageType.Info)}>
              Set type <b>Info</b>
            </CtxMenuItem>
          )
        }
        {
          editedMessage.type !== EMessageType.Success && (
            <CtxMenuItem className={EMessageType.Success} data={{ foo: 'bar' }} onClick={() => handleSetStatus(EMessageType.Success)}>
              Set type <b>Success</b>
            </CtxMenuItem>
          )
        }
        {
          editedMessage.type !== EMessageType.Warn && (
            <CtxMenuItem className={EMessageType.Warn} data={{ foo: 'bar' }} onClick={() => handleSetStatus(EMessageType.Warn)}>
              Set type <b>Warn</b>
            </CtxMenuItem>
          )
        }
        {
          editedMessage.type !== EMessageType.Danger && (
            <CtxMenuItem className={EMessageType.Danger} data={{ foo: 'bar' }} onClick={() => handleSetStatus(EMessageType.Danger)}>
              Set type <b>Danger</b>
            </CtxMenuItem>
          )
        }
        {!!editedMessage.type && (
          <CtxMenuItem className='unset-status' data={{ foo: 'bar' }} onClick={() => handleUnsetStatus()}>
            Unset status
          </CtxMenuItem>
        )}
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
            <FormControl mt={4}>
              <FormLabel>Text</FormLabel>
              <Textarea
                isInvalid={!editedMessage?.text}
                resize="none"
                placeholder="Message"
                ref={initialRef}
                // onKeyDown={handleKeyDownEditedMessage}
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

      <div className='main-wrapper'>
        <Flex
          className="room"
          flexDirection="column"
          width={{ base: '100%', sm: '450px', md: '550px' }}
          height={{ base: '100%', sm: 'auto' }}
        >
          <Heading className="heading" as="h4" p={[4, 4]} borderRadius="8px 8px 0 0">
            <Flex alignItems="center" justifyContent="flex-start">
              <Menu>
                <>
                  <MenuButton as={IconButton} icon={<FiList size={18} />} isRound="true" />
                  <ColorModeSwitcher justifySelf="flex-end" mr={2} />
                </>
                <MenuList
                  _dark={{ bg: "gray.600" }}
                  // _hover={{ bg: "gray.500", color: 'white' }}
                  // _expanded={{ bg: "gray.800" }}
                  // _focus={{ boxShadow: "outline" }}
                >
                  <MenuItem
                    _hover={{ bg: "gray.400", color: 'white' }}
                    _focus={{ bg: "gray.400", color: 'white' }}
                    minH="40px"
                    key="tasklist-btn"
                    onClick={handleTasklistModalOpen}
                  >
                    <Text fontSize="md" fontWeight='bold'>Tasklist{tasklist.length > 0 ? ` ${percentage}% (${completedTasksLen} of ${tasklist.length})` : ''}</Text>
                  </MenuItem>
                  <MenuDivider />
                  <MenuOptionGroup defaultValue="asc" title={`Users online: ${users.length}`}>
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
                          <Text fontSize="md">{user.name}</Text>
                        </MenuItem>
                      )
                    })}
                  </MenuOptionGroup>
                  <MenuDivider />
                  {isAdmin && (
                    <MenuItem
                      _hover={{ bg: "gray.400", color: 'white' }}
                      _focus={{ bg: "gray.400", color: 'white' }}
                      minH="40px"
                      key="adm-btn"
                      onClick={() => {
                        history.push('/admin')
                      }}
                    >
                      <Text fontSize="md">Admin panel</Text>
                    </MenuItem>
                  )}
                  <MenuItem
                    _hover={{ bg: "gray.400", color: 'white' }}
                    _focus={{ bg: "gray.400", color: 'white' }}
                    minH="40px"
                    key="set-passwd-btn"
                    onClick={handleSetPasswordModalOpen}
                  >
                    <Text fontSize="md">Set my password</Text>
                  </MenuItem>
                  <MenuItem
                    _hover={{ bg: "gray.400", color: 'white' }}
                    _focus={{ bg: "gray.400", color: 'white' }}
                    minH="40px"
                    key="my-info-btn"
                    onClick={handleMyInfoModalOpen}
                  >
                    <Text fontSize="md">My info</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
              <Flex alignItems="flex-start" flexDirection="column" flex={{ base: '1', sm: 'auto' }}>
                {/* <Heading fontSize="lg">{room.slice(0, 1).toUpperCase() + room.slice(1)}</Heading> */}
                <Heading fontSize='lg' fontFamily='Jura'>
                  {room} {isChatLoading && !!tsPoint && (
                    <Spinner size='xs' />
                  )}
                </Heading>
                <Flex alignItems="center">
                  <Text mr="2" fontWeight="400" fontSize="md" letterSpacing="0">
                    {name}
                  </Text>
                  <Box h={2} w={2} borderRadius="100px" bg={isConnected ? 'green.300' : 'red.300'}></Box>
                </Flex>
              </Flex>
              <IconButton
                aria-label="Logout"
                // colorScheme={isMsgLimitReached ? 'red' : 'gray'}
                isRound
                icon={<IoMdLogOut size={18} />}
                onClick={handleLogout}
                // disabled={!message}
                // isLoading={isSending}
              >
                Logout
              </IconButton>
              {/* <Button fontSize="sm" onClick={handleLogout} variant='outline'>
                {isConnected ? 'Logout' : 'Reconnect'}
              </Button> */}
            </Flex>
          </Heading>

          <Box w='100%' h={1} m={[0, 0]}>
            {tasklist.length > 0 && <Progress value={percentage} size="xs" colorScheme="green" />}
          </Box>

          <ScrollToBottom
            className={
              clsx(
                "messages",
                // "height-limited-md",
                { "height-limited-md": upToSm, "height-full-auto-sm": downToSm }
              )}
            debug={false}
            // debounce={1000}
          >
            <Flex ref={inViewRef} alignItems="center" justifyContent='center' width='100%' opacity=".35" mb={4}>
              <Box mr="2">---</Box>
              {!!tsPoint ? <Spinner fontSize="1rem" /> : <BiMessageDetail fontSize="1.1rem" />}
              <Text ml={2} fontWeight="400">
                {!!tsPoint
                  ? `Загрузка от ${getNormalizedDateTime2(tsPoint)} и старше`
                  : 'Больше ничего нет'
                }
              </Text>
              <Box ml="2">---</Box>
            </Flex>
            {messages.map((message: TMessage, i) => {
              const { user, text, ts, editTs, type } = message
              const isMyMessage = user === name
              const date = getNormalizedDateTime(ts)
              const editDate = !!editTs ? getNormalizedDateTime(editTs) : null
              const isLast = i === messages.length - 1
              const showElm = false // text.length >= 15

              return (
                <Box
                  key={`${user}-${ts}-${editTs || 'original'}-${type || 'no-type'}`}
                  className={clsx('message', { 'my-message': isMyMessage, 'oponent-message': !isMyMessage })}
                  // style={transform}
                  m=".2rem 0"
                >
                  <Text
                    fontSize="sm"
                    // opacity=".8"
                    mb={1}
                    className="from"
                  >
                    <b>{user}</b>{' '}
                    <span className="date">
                      {date}
                      {!!editDate && <b>{' '}Edited</b>}
                    </span>
                  </Text>
                  {isMyMessage ? (
                    <ContextMenuTrigger id="same_unique_identifier" key={`${user}-${ts}-${editTs || 'original'}-${type || 'no-type'}`}>
                      <Text
                        fontSize="md"
                        className={clsx("msg", { [type]: !!type })}
                        p=".4rem .8rem"
                        // bg="white"
                        color="white"
                        onContextMenu={() => {
                          setEditedMessage(message)
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
                  {isLast && showElm && <div className='abs-tail'><div className='wrapped' /></div>}
                </Box>
              )
            })}
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
              variant='unstyled'
              pl={4}
              fontWeight='md'
            />
            <label htmlFor="msg" className='absolute-label'>{left} left</label>
            <IconButton
              aria-label="Send"
              // colorScheme={isMsgLimitReached ? 'red' : 'gray'}
              isRound
              icon={<RiSendPlaneFill size={15} />}
              onClick={handleSendMessage}
              disabled={!message}
              isLoading={isSending}
            >
              Send
            </IconButton>
          </div>
        </Flex>
      </div>
    </>
  )
}
