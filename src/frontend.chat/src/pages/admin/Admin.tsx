import React, { useEffect, useMemo, useState } from 'react'
import { useMainContext } from '~/context/mainContext'
import { useUsersContext } from '~/context/usersContext'
import { useSocketContext } from '~/context/socketContext'
import { useToast,
  // UseToastOptions,
} from '@chakra-ui/react'
import { useHistory } from 'react-router-dom'
import { Card } from '~/common/containers/Layout/Card'
import { SimpleGrid, Button, Grid, GridItem, Input } from '@chakra-ui/react'
import { BsArrowLeft } from 'react-icons/bs'
import ReactJson from 'react-json-view'

type TMessage = {
  text: string
  ts: number
}
type TRoomData = {
  [userName: string]: TMessage[]
}
type TRoomsData = {
  [roomName: string]: TRoomData
}

export const Admin = () => {
  const { room, name, isAdmin } = useMainContext()

  const { allUsers } = useUsersContext()
  const [roomsData, setRoomsData] = useState<TRoomsData | null>(null)
  const { socket } = useSocketContext()
  const toast = useToast()
  const history = useHistory()

  // useEffect(() => {
  //   if (!isAdmin) history.push('/') 
  // }, [history, isAdmin])

  const handleClick = () => {
    if (!!socket) socket.emit('getAllInfo', { a: 1 })
  }
  const goChat = () => {
    history.push('/chat')
  }

  useEffect(() => {
    const rmsListener = ({ roomsData }: any) => {
      setRoomsData(roomsData)
    }
    if (!!socket) socket.on('allRooms', rmsListener)

    return () => {
      if (!!socket) socket.off('allRooms', rmsListener)
    }
  }, [socket])

  useEffect(() => {
    if (!!socket && !!name && !!room) {
      socket.emit('setMeAgain', { name, room }, (err?: string) => {
        if (!!err) {
          toast({ title: err })
          history.push('/')
        }
      })

      return () => {
        socket.emit('unsetMe', { name, room })
      }
    }
  }, [socket, toast, name, room, history])

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0];
    // @ts-ignore
    body.style.overflowY = 'auto'
    return () => {
    // @ts-ignore
    body.style.overflowY = 'hidden'
    }
  }, [])

  const [searchRoom, setSearchRoom] = useState<string>('')
  const [searchUser, setSearchUser] = useState<string>('')
  const usersFiltered = useMemo(
    () =>
      !!searchUser ? allUsers.filter(({ name }) => name.toLowerCase().includes(searchUser.toLowerCase())) : allUsers,
    [searchUser, allUsers]
  )
  const roomsFiltered = useMemo(
    () =>
      !!roomsData && !!searchRoom
        ? Object.keys(roomsData).reduce((acc, roomName) => {
            if (roomName.toLowerCase().includes(searchRoom.toLowerCase())) {
              // @ts-ignore
              acc[roomName] = roomsData[roomName]
            }
            return acc
          }, {})
        : roomsData || null,
    [searchRoom, roomsData]
  )

  return (
    <div
    // maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }} style={{ maxHeight: '100vh', overflowY: 'auto', paddingBottom: '40px' }}
    >
      {/* <chakra.h1
        textAlign={'center'}
        fontSize={'sm'}
        py={10}
        fontWeight={'bold'}
      >
        {slugifiedRoom}
      </chakra.h1> */}
      <SimpleGrid columns={{ base: 1, md: 8 }} spacing={{ base: 4, lg: 4 }} marginBottom={{ base: 4 }}>
        <Button color="gray.500" leftIcon={<BsArrowLeft />} fontSize="sm" onClick={goChat}>
          Chat
        </Button>
        <Button color="gray.500" backgroundColor="white" fontSize="sm" onClick={handleClick}>
          Get All Rooms
        </Button>
        <Input
          placeholder="Search room"
          value={searchRoom}
          onChange={(e) => {
            setSearchRoom(e.target.value)
          }}
        />
        <Input
          placeholder="Search user"
          value={searchUser}
          onChange={(e) => {
            setSearchUser(e.target.value)
          }}
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, lg: 4 }} marginBottom={{ base: 4 }}>
        <Card title="allUsers">{!!usersFiltered ? <ReactJson src={usersFiltered} collapsed /> : <div>No data</div>}</Card>
        <Card title="roomsData">{!!roomsFiltered ? <ReactJson src={roomsFiltered} collapsed /> : <div>No data</div>}</Card>
      </SimpleGrid>
      <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
        <GridItem rowSpan={2} colSpan={1} bg="tomato"></GridItem>
        <GridItem colSpan={2} bg="papayawhip" />
        <GridItem colSpan={2} bg="papayawhip" />
        <GridItem colSpan={4} bg="tomato" />
      </Grid>
    </div>
  )
}
