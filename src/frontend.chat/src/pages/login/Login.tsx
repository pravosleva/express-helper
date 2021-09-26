import { useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { MainContext } from '~/mainContext'
import { SocketContext } from '~/socketContext'
import { Flex, FormControl, FormLabel, Heading, IconButton, Input } from '@chakra-ui/react'
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

  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { useLocalStorage } from 'react-use'
// import { useForm } from '~/common/hooks/useForm'
import { RoomlistModal } from './components'

export const Login = () => {
  const { socket, setIsLogged, resetRoomData } = useContext(SocketContext)
  const { name, setName, room, setRoom, slugifiedRoom, setIsAdmin } = useContext(MainContext)
  const history = useHistory()
  const toast = useToast()
  const location = useLocation()
  const [isRoomDisabled, setIsRoomDisabled] = useState(false)

  // --- LS
  const [nameLS, setNameLS, removeNameLS] = useLocalStorage<string>('chat.my-name', '')
  const [tokenLS, setTokenLS] = useLocalStorage<any>('chat.token')
  const [roomlistLS, setRoomlistLS] = useLocalStorage<any>('chat.roomlist', [])
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
      setRoom(openRoomName)
      setIsRoomDisabled(true)

      queryParams.delete('room')
      history.replace({ search: queryParams.toString() })
    }
  }, [location.search, history, setRoom])

  const { isOpen: isPasswordModalOpen, onOpen: handlePasswordModalOpen, onClose: handlePasswordModalClose } = useDisclosure()
  const [isLoading1, setIsLoading1] = useState<boolean>(false)
  const [isLoading2, setIsLoading2] = useState<boolean>(false)

  const handleLogin = useCallback(() => {
    setNameLS(name)
    if (!!socket)
      setIsLoading1(true)
      // @ts-ignore
      socket.emit(
        'login',
        { name, room: slugifiedRoom, token: String(tokenLS) },
        (error: string, isAdmin?: boolean) => {
          if (!!error) {
            if (error === 'FRONT:LOG/PAS') {
              handlePasswordModalOpen()
              return
            }
            toast({
              position: 'top',
              title: 'Error',
              description: error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
            setIsLoading1(false)
            return
          }
          if (isAdmin) setIsAdmin(true)

          setIsLogged(true)
          setIsLoading1(false)
          setRoomlistLS([...new Set([...roomlistLS, room])])
          history.push('/chat')
        }
      )
  }, [slugifiedRoom, name, tokenLS, room, history, roomlistLS, setIsAdmin, setIsLogged, setNameLS, setRoomlistLS, handlePasswordModalOpen, socket])

  const handleKeyDown = (ev: any) => {
    if (ev.keyCode === 13) {
      if (!!room) handleLogin()
    }
  }

  const [myPassword, setMyPassword] = useState<{ password: string }>({ password: '' })
  const handleTryLoginWidthPassword = () => {
    if (!!socket) {
      setIsLoading2(true)
      socket.emit('login.password', { password: myPassword.password, token: String(tokenLS), name, room }, (err?: string, isAdmin?: boolean, token?: string) => {
        if (!!err) {
          toast({
            position: 'top',
            description: err,
            status: 'error',
            duration: 2000,
            isClosable: true,
          })
          setIsLoading2(false)
          return
        } else {
          if (!!token) setTokenLS(token)
          if (isAdmin) setIsAdmin(true)
          setIsLogged(true)
          setIsLoading2(false)
          toast({
              position: "top",
              title: "Hey there",
              description: `Hello, ${name}`,
              status: "success",
              duration: 3000,
              isClosable: true,
          })
          history.push('/chat')
        }
      })
    }
  }
  const handleKeyDownPassword = (ev: any) => {
    if (ev.keyCode === 13) {
      if (!!room) handleTryLoginWidthPassword()
    }
  }
  const handleChangePassword = (e: any) => {
    setMyPassword((state) => ({ ...state, password: e.target.value }))
  }
  const passwordRef = useRef(null)

  // --- Roomlist:
  const [isRoomlistModalOpened, setRoomlistModalOpened] = useState<boolean>(false)
  const handleRoomlistModalOpen = () => {
    setRoomlistModalOpened(true)
  }
  const handleRoomlistModalClose = () => {
    setRoomlistModalOpened(false)
  }
  const handleDeleteRoomFromLS = (roomName: string) => {
    setRoomlistLS([...new Set(roomlistLS.filter((room: string) => room !== roomName))])
    handleRoomlistModalClose()
  }
  const handleSelectRoom = (roomName: string) => {
    // resetRoomData()
    setRoom(roomName)
    handleRoomlistModalClose()
  }
  // ---

  return (
    <>
      <RoomlistModal
        roomlist={roomlistLS}
        isOpened={isRoomlistModalOpened}
        onDelete={handleDeleteRoomFromLS}
        onClose={handleRoomlistModalClose}
        onSelectRoom={handleSelectRoom}
      />

      <Modal
        size="xs"
        initialFocusRef={passwordRef}
        // finalFocusRef={textFieldRef}
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Need password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Login</FormLabel>
              <Input
                type='login'
                placeholder="Login"
                isDisabled
                value={name}
              />
            </FormControl>
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
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleTryLoginWidthPassword} isLoading={isLoading2}>
              Submit
            </Button>
            <Button onClick={handlePasswordModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalOpened} onClose={handleCloseModal} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your name is</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{nameLS}?</ModalBody>

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

      <div style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Flex className="login" flexDirection="column" mb="8">
          <Heading
            as="h1"
            size="3xl"
            textAlign="center"
            mb="8"
            fontFamily="Wallpoet"
          >
            Let's talk
          </Heading>
          <Flex className="form" gap="1rem" flexDirection={{ base: 'column', md: 'row' }}>
            <Input
              autoFocus
              variant="filled"
              mr={{ base: '0', md: '4' }}
              mb={{ base: '4', md: '0' }}
              type="text"
              placeholder="User Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
            <Input
              disabled={isRoomDisabled}
              variant="filled"
              mr={{ base: '0', md: '4' }}
              mb={{ base: '4', md: '0' }}
              type="text"
              placeholder="Room Name"
              value={room}
              onChange={(e) => {
                setRoom(e.target.value)
              }}
              onKeyDown={handleKeyDown}
            />
            <IconButton
              colorScheme="blue"
              isRound
              aria-label="icon-btn"
              icon={<RiArrowRightLine />}
              isLoading={isLoading1}
              onClick={handleLogin}
              isDisabled={!name || !room}
            ></IconButton>
          </Flex>
          <Button
            colorScheme="gray"
            variant='ghost'
            mt={3}
            onClick={handleRoomlistModalOpen}
          >
            My Rooms
          </Button>
        </Flex>
      </div>
    </>
  )
}
