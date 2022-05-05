import React, { useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { MainContext } from '~/context/mainContext'
import { SocketContext } from '~/context/socketContext'
import { Breakpoint, Flex, FormControl, FormLabel, Heading, HStack, IconButton, Input, PinInput, PinInputField } from '@chakra-ui/react'
import { RiArrowRightLine } from 'react-icons/ri'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Grid,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { useLocalStorage } from 'react-use'
// import { useForm } from '~/common/hooks/useForm'
import { RoomlistModal } from './components'
import slugify from 'slugify'
// import { FocusableElement } from "@chakra-ui/utils"
import pkg from '../../../package.json'
// import { useCookies } from 'react-cookie'
// import axios from 'axios'
// import { FiArrowRight } from 'react-icons/fi'
import { openExternalLink } from '~/utils/openExternalLink'
// const handleOpenExternalLink = useCallback(openExternalLink, [])
import debounce from 'lodash.debounce'
import { jwtHttpClient } from '~/utils/httpClient'
import { EAPIUserCode, TUserResData } from '~/utils/httpClient/types'

const isDev = process.env.NODE_ENV === 'development'
const REACT_APP_CHAT_NAME = process.env.REACT_APP_CHAT_NAME || 'PUB DEV 2021'
const REACT_APP_BUILD_DATE = process.env.REACT_APP_BUILD_DATE || ''
// const REACT_APP_API_URL = process.env.REACT_APP_API_URL || ''
const REACT_APP_PRAVOSLEVA_BOT_BASE_URL = process.env.REACT_APP_PRAVOSLEVA_BOT_BASE_URL || 'https://t.me/pravosleva_bot'

type TLocalRoomItem = {
  name: string
  ts: number
}

const delay = (ms = 3000) => new Promise((res) => setTimeout(res, ms))

export const Login = () => {
  // const [isVerified, setIsVerified] = useState<boolean>(false)
  const {
    socket,
    setIsLogged,
    // resetRoomData,
  } = useContext(SocketContext)
  const { name, setName, room, setRoom, slugifiedRoom, setIsAdmin } = useContext(MainContext)
  const history = useHistory()
  const toast = useToast()
  const location = useLocation()
  const [isRoomDisabled, setIsRoomDisabled] = useState(false)

  // --- LS
  const [nameLS, setNameLS, removeNameLS] = useLocalStorage<string>('chat.my-name', '')
  // useEffect(() => {
  //   if (!!nameLS) setName(nameLS)
  // }, [nameLS])
  const [lastRoomLS, setLastRoomLS, _removeLastRoomLS] = useLocalStorage<string>('chat.last-room', '')
  const [tokenLS, setTokenLS] = useLocalStorage<any>('chat.token')
  const [roomlistLS, setRoomlistLS] = useLocalStorage<TLocalRoomItem[]>('chat.roomlist', [])
  const roomNames = useMemo(() => !!roomlistLS ? roomlistLS.filter(({ name }) => !!name).map(({ name }) => name) : [], [roomlistLS])
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
    setIsLoading1(false)
  }
  const countRef = useRef(0)

  useEffect(() => {
    if (!name && countRef.current === 0) {
      if (!!nameLSRef.current) {
        setName(nameLSRef.current)
        handleOpenModal()
      }
    } else {
      countRef.current += 1
    }
  }, [handleOpenModal, setName, nameLS, name])
  // ---

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const openRoomName: string | null = queryParams.get('room')

    if (!!openRoomName) {
      setRoom(slugify(openRoomName))
      setIsRoomDisabled(true)

      queryParams.delete('room')
      history.replace({ search: queryParams.toString() })
    }
  }, [location.search, history, setRoom])

  const { isOpen: isPasswordModalOpen, onOpen: handlePasswordModalOpen, onClose: handlePasswordModalClose } = useDisclosure()
  const [isLoading1, setIsLoading1] = useState<boolean>(false)
  const [isLoading2, setIsLoading2] = useState<boolean>(false)
  // const axiosCancelToken = useRef<any>(null)
  // const axiosCancelToken2 = useRef<any>(null)

  const _tryLogin = useCallback(async (sR?: string) => {
    if (!sR && !slugifiedRoom) {
      console.log('ABORTED. Reason: !sR && !slugifiedRoom')
      return
    }

    // console.log('- try login')
    setIsLoading1(true)
    if (isDev || name === 'pravosleva') {
      toast({
        position: 'top-left',
        title: '/check-jwt',
        // description: error,
        status: 'warning',
        duration: 2000,
      })
    }

    // TODO: await check jwt
    // const jwtChecked = await axios(`${REACT_APP_API_URL}/chat/api/auth/check-jwt`, {
    //   method: 'POST',
    //   cancelToken: axiosCancelToken.current,
    // })
    //   .then((res) => res.data)
    //   .catch((err) => err)

    const jwtResponse: TUserResData = await jwtHttpClient.checkJWT({ username: name }).then(r => r).catch(e => e).finally(() => { setIsLoading1(false) })

    let isLogged: boolean = false

    switch (true) {
      case (!jwtResponse?.ok):
        console.log('JWT is not Ok')
        console.dir(jwtResponse)
        // NOTE: Fail cases:
        if (isDev) toast({
          position: 'bottom-left',
          title: jwtResponse?.message || jwtResponse?.code || '!jwtResponse?.ok',
          status: 'warning',
          description: `Debug${!!jwtResponse?.code ? `: ${jwtResponse.code}` : ''}`,
        })

        switch (jwtResponse.code) {
          case EAPIUserCode.NeedLogout:
            // TODO: handleOpenLogoutConfirmation()
            const isLogoutConfirmed = window.confirm('Need Logout! Wanna be logout?')

            if (isLogoutConfirmed) {
              const res = await jwtHttpClient.logout()
                .then(r => r)
                .catch(r => r)
              if (res.ok) {
                toast({ position: 'bottom', title: 'Unlogged', status: 'info', description: 'Try again' })
              } else {
                toast({ position: 'bottom', title: 'Oops... Что-то пошло не так', status: 'error', description: 'Need Logout' })
              }
            }
            return;
          default: break;
        }
        break;
      default:
        // console.log('JWT is Ok')
        // console.dir(jwtResponse)
        // if (isDev || (jwtResponse?.ok && jwtResponse.code === EAPIUserCode.Logged)) isLogged = true
        if (jwtResponse?.ok && jwtResponse.code === EAPIUserCode.Logged) {
          if (jwtResponse.regData?.tg?.username === name) isLogged = true
        }
        break;
    }

    const addRoom = (newRoom: string) => {
      const rooms: any = {}
      const nowTs = Date.now()

      if (!!roomlistLS) {
        roomlistLS.forEach(({ name, ts }) => {
          if (!!name) {
            rooms[slugify(name)] = {
              name,
              ts: name === room ? nowTs : ts,
            }
          }
        })

        rooms[newRoom] = {
          name: newRoom,
          ts: nowTs
        }
        setRoomlistLS(Object.values(rooms))
      } else {
        setRoomlistLS([{ name: room, ts: nowTs }])
      }
    }

    const normalizedRoom = !!sR ? slugify(sR) : slugifiedRoom
    if (isLogged) {
      toast({ position: 'bottom', title: `Hello, ${jwtResponse.regData?.tg?.username || 'ERR'}`, status: 'info' })
      if (!!normalizedRoom) setLastRoomLS(normalizedRoom)
      addRoom(sR || slugifiedRoom)
      setNameLS(name)
      history.push('/chat')
    }

    // if (isDev) history.push('/chat')

    if (!!socket) { // && !!room && !!name
      setIsLoading1(true)
      // @ts-ignore
      socket.emit(
        'login',
        {
          name,
          room: normalizedRoom,
          // token: String(tokenLS),
          isLogged
        },
        (error: string, isAdmin?: boolean) => {
          // if (isDev) { history.push('/chat'); return; }

          if (!!error) {
            if (error === 'FRONT:LOG/PAS') {
              handlePasswordModalOpen()
              setIsLoading1(false)
              setNameLS(name)
              return
            }
            toast({
              position: 'top-left',
              title: 'Error by socket',
              description: error,
              status: 'error',
              // duration: 5000,
              isClosable: true,
            })
            setIsLoading1(false)
            return
          }
          if (isAdmin) setIsAdmin(true)

          setIsLogged(true)
          setIsLoading1(false)
          // setRoomlistLS([...new Set([...roomlistLS, slugifiedRoom])])
          // --

          addRoom(sR || slugifiedRoom)
          setLastRoomLS(normalizedRoom)
          setNameLS(name)
          // --
          history.push('/chat')
        }
      )
    }
  }, [slugifiedRoom, name, tokenLS, room, history, roomlistLS, setIsAdmin, setIsLogged, setNameLS, setRoomlistLS, handlePasswordModalOpen, socket])
  const tryLogin = useMemo(
    () => debounce(_tryLogin, 1000), // { leading: true, trailing: false }
    [_tryLogin]
  );

  const handleKeyDown = (ev: any) => { if (ev.keyCode === 13 && !!room) tryLogin() }

  // const [myPassword, setMyPassword] = useState<{ password: string }>({ password: '' })
  const _handleTryLoginWidthPassword = async (pas?: string) => {
    if (isDev || name === 'pravosleva') toast({
      position: 'top-left',
      title: '/login',
      // description: error,
      status: 'warning',
      duration: 2000,
    })
    // console.log(pas)
    // if (!!pas) {
    setIsLoading2(true)
    const data: any = await jwtHttpClient.login({ username: name, password: pas || '', room }).then((res) => res).catch((err) => err).finally(() => { setIsLoading2(false) })
    
    // console.log(data)
    const isLogged = !!data?.ok && data.code === EAPIUserCode.Logged

    // window.alert(JSON.stringify(data, null, 2))

    if (isLogged) {
      toast({ title: "JWT received", status: "success", duration: 3000, position: "top-left" })
    } else {
      toast({ title: "Error Log/Pas", description: data?.message || `Oops... Sorry: ${data?.code || 'No res.code'}`, status: "error", position: "top-left" })
      return
    }
    if (!!socket) {
      setIsLoading2(true)
      socket.emit(
        'login.password',
        { /* password: pas || myPassword.password, */ isLogged, token: String(tokenLS), name, room: slugifiedRoom },
        (err?: string, isAdmin?: boolean, token?: string) => {
          if (!!err) {
            // console.log('- this case')
            console.log(err)
            toast({ description: err, status: 'error', duration: 2000, isClosable: true, position: 'top-left' })
            setIsLoading2(false)
            setIsLoading1(false)
            return
          } else {
            if (!!token) setTokenLS(token)
            if (isAdmin) setIsAdmin(true)
            setIsLogged(true)
            setIsLoading2(false)
            setIsLoading1(false)
            // setRoomlistLS([...new Set([...roomlistLS, slugifiedRoom])])
            // --
            const rooms: any = {}
            const nowTs = Date.now()
  
            if (!!roomlistLS) {
              roomlistLS.forEach(({ name, ts }) => {
                if (!!name) {
                  rooms[name] = {
                    name,
                    ts: name === room ? nowTs : ts,
                  }
                }
              })
              rooms[room] = {
                name: room,
                ts: nowTs
              }
              setRoomlistLS(Object.values(rooms))
            } else {
              setRoomlistLS([{ name: room, ts: nowTs }])
            }
            setLastRoomLS(slugifiedRoom)
            setNameLS(name)
            // --
            // toast({ position: "bottom", title: "Hey there", description: `Hello, ${name}`, status: "success", duration: 3000, isClosable: true })
            history.push('/chat')
          }
        }
      )
    }
    // }
  }
  const handleTryLoginWidthPassword = useMemo(
    () => debounce(_handleTryLoginWidthPassword, 1000, { leading: true, trailing: false }),
    [_handleTryLoginWidthPassword]
  );
  // const handleKeyDownPassword = (ev: any) => { if (ev.keyCode === 13) { if (!!room) handleTryLoginWidthPassword() } }
  // const handleChangePassword = (e: any) => { setMyPassword((state) => ({ ...state, password: e.target.value })) }
  const passwordRef = useRef(null)
  const loginBtnRef = useRef<any>(null)

  // --- Roomlist:
  const [isRoomlistModalOpened, setRoomlistModalOpened] = useState<boolean>(false)
  const handleRoomlistModalOpen = () => {
    setRoomlistModalOpened(true)
  }
  const handleRoomlistModalClose = () => {
    setRoomlistModalOpened(false)
  }
  const handleDeleteRoomFromLS = (roomName: string) => {
    // setRoomlistLS([...new Set(roomlistLS.filter((room: TLocalRoomItem) => room.name !== roomName))])
    if (!!roomlistLS) {
      const newRoomList = roomlistLS.filter(({ name }: TLocalRoomItem) => name !== roomName && (slugify(name.toLowerCase()) !== slugify(roomName.toLowerCase())))

      // console.log(newRoomList)
      setRoomlistLS(newRoomList)
    }
    // handleRoomlistModalClose()
  }
  const handleSelectRoom = (roomName: string) => {
    // resetRoomData()
    setRoom(roomName)
    handleRoomlistModalClose()
    if (!!loginBtnRef.current) loginBtnRef.current.focus()
    // setIsLoading1(true)
    // setTimeout(tryLogin, 1000)
    return Promise.resolve()
  }
  // ---

  // const isSubmitDisabled = useMemo(() => !(!!name && myPassword.password.length === 4), [name, myPassword.password])
  const handleOpenExternalLink = useCallback(openExternalLink, [])

  // useEffect(() => {
  //   console.log('- EFFECT', lastRoomLS, renderCount)
  //   if (renderCount === 0 && !!lastRoomLS) tryLogin(lastRoomLS)

  //   renderCount += 1
  // }, [])

  return (
    <>
      <RoomlistModal
        roomlist={roomNames}
        isOpened={isRoomlistModalOpened}
        onDelete={handleDeleteRoomFromLS}
        onClose={handleRoomlistModalClose}
        onSelectRoom={(room: string) => {
          const slugifiedRoom = slugify(room.trim().toLowerCase())
          handleSelectRoom(slugifiedRoom)
            .then(async () => {
              setIsLoading1(true)
              await delay(1000)
              tryLogin(slugifiedRoom)
            })
            .catch((err) => {
              console.log(err)
            })
        }}
      />

      <Modal
        size="xs"
        initialFocusRef={passwordRef}
        finalFocusRef={loginBtnRef}
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent rounded='2xl'>
          <ModalHeader>
            <Flex justifyContent='center'>
            <FormControl mt={4} maxWidth={200}>
              <FormLabel>Login</FormLabel>
              <Input
                type='login'
                placeholder="Login"
                variant='filled'
                // isDisabled
                readOnly
                value={name}
                rounded='3xl'
              />
            </FormControl>
            </Flex>
            <Box mt={5} style={{ display: 'flex', justifyContent: 'center' }}>
              <HStack m='0 auto'>
                <PinInput
                  autoFocus
                  mask
                  defaultValue=''
                  // onChange={(value: string) => { handleChangePassword({ target: { value } }) }}
                  onComplete={(value: string) => {
                    if (!!name && !isLoading2 && !!room && value.length === 4) {
                      handleTryLoginWidthPassword(value)
                    }
                  }}
                >
                  <PinInputField rounded='3xl' autoComplete='off' />
                  <PinInputField rounded='3xl' autoComplete='off' />
                  <PinInputField rounded='3xl' autoComplete='off' />
                  <PinInputField rounded='3xl' autoComplete='off' />
                </PinInput>
              </HStack>
            </Box>
            {/*
            <FormControl mt={4}>
              <FormLabel>Password</FormLabel>
              <Input
                isInvalid={!myPassword.password}
                resize="none"
                placeholder="Password"
                // ref={initialRef}
                onKeyDown={handleKeyDownPassword}
                value={myPassword.password}
                onChange={handleChangePassword}
                ref={passwordRef}
                type='password'
                autoComplete='false'
              />
            </FormControl>
            */}
          </ModalHeader>
          <ModalCloseButton rounded='3xl' />
          {/* <ModalBody pb={6}>
            
          </ModalBody> */}

          <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* <Grid templateColumns='2fr 2fr 1fr' gap={2}></Grid> */}

            <Button mr={2} size='sm' variant='link' onClick={handleOpenExternalLink(`${REACT_APP_PRAVOSLEVA_BOT_BASE_URL}?start=invite-chat_${room}`)}>Регистрация</Button>
            <Button size='sm' variant='link' onClick={handleOpenExternalLink(`${REACT_APP_PRAVOSLEVA_BOT_BASE_URL}?start=invite-chat_${room}`)}>Забыли пароль?</Button>
            {/*
            <Button size='xs' colorScheme="blue" onClick={() => handleTryLoginWidthPassword()} isLoading={isLoading2} isDisabled={isSubmitDisabled}>
              <FiArrowRight size={18} />
            </Button>
            */}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalOpened} onClose={handleCloseModal} size="xs" autoFocus={false} isCentered>
        <ModalOverlay />
        <ModalContent rounded='2xl'>
          <ModalHeader>Your name is<br />{name}?</ModalHeader>
          <ModalCloseButton rounded='3xl' />
          {/* <ModalBody><Text size='lg'></Text></ModalBody> */}

          <ModalFooter>
            <Button variant="ghost" mr={2} onClick={handleClearName} rounded='3xl'>
              No
            </Button>
            <Button
              // autoFocus
              colorScheme="blue"
              onClick={() => {
                setName(nameLSRef.current)
                handleCloseModal()
                tryLogin()
              }}
              rounded='3xl'
            >
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Flex className="login" flexDirection="column" mb="8">
          <Heading
            as="h1"
            size="3xl"
            textAlign="center"
            mb="8"
            fontFamily="Bahiana"
          >
            {REACT_APP_CHAT_NAME}
          </Heading>
          <Flex className="form" gap="1rem" flexDirection={{ base: 'column', md: 'column' }} mb={4}>
            <Box
              // mr={{ base: '4', md: '4' }}
              mb={{ base: '4', md: '4' }}
              style={{
                // border: '1px solid red',
                width: '100%'
              }}
            >
              <Text mb={1}>Username</Text>
              <Input
                autoFocus
                variant="filled"
                
                type="text"
                placeholder="User Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                rounded='3xl'
              />
            </Box>
            {/*
              !isRoomDisabled && (
                <Box
                  mr={{ base: '0', md: '4' }}
                  mb={{ base: '4', md: '0' }}
                >
                  <Text mb={1}>Room</Text>
                  <Input
                    disabled={isRoomDisabled}
                    variant="filled"
                    
                    type="text"
                    placeholder="Room Name"
                    value={room}
                    onChange={(e) => {
                      setRoom(e.target.value)
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </Box>
              )
            */}
            <IconButton
              mt='auto'
              ref={loginBtnRef}
              colorScheme={!room ? "gray" : "blue"}
              isRound
              aria-label="icon-btn"
              icon={<RiArrowRightLine />}
              isLoading={isLoading1}
              onClick={() => {
                setIsLoading1(true)
                tryLogin()
              }}
              isDisabled={!name || !room}
            />
          </Flex>
          {
            // !!roomlistLS && roomlistLS.length > 0 && (
            <Button
              tabIndex={10}
              colorScheme={!room ? "blue" : "gray"}
              variant='ghost'
              onClick={handleRoomlistModalOpen}
              isDisabled={!name}
              rounded='3xl'
            >
              My Rooms
            </Button>
          }
          <Flex mt={1} justifyContent='center'>Все еще доступен режим Гостя под свободным ником</Flex>
          {!!REACT_APP_BUILD_DATE && (
            <Flex mt={1} justifyContent='center'>v{pkg.version} Last build {REACT_APP_BUILD_DATE.split(' ')[0]}</Flex>
          )}
        </Flex>
      </div>
    </>
  )
}
