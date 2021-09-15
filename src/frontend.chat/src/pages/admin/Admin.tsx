import { useEffect, useState } from 'react'
import { useMainContext } from '~/mainContext'
import { useUsersContext } from '~/usersContext'
import { useSocketContext } from '~/socketContext'
import { useToast, UseToastOptions } from "@chakra-ui/react"
import { useHistory } from 'react-router-dom'
import { Card } from '~/common/containers/Layout/Card'
import {
  Box,
  chakra,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { StatsCard } from './components'
import { BsArrowLeft } from 'react-icons/bs'

export const Admin = () => {
  const { slugifiedRoom, room, name } = useMainContext()
  const { allUsers } = useUsersContext()
  const [roomsData, setRoomsData] = useState(null)
  const { socket } = useSocketContext()
  const toast = useToast()
  const history = useHistory()

  const handleClick = () => {
    if (!!socket) socket.emit("getAllInfo", { a: 1 })
  }
  const goChat = () => {
    history.push('/chat')
  }

  useEffect(() => {
    const rmsListener = ({ roomsData }: any) => {
      setRoomsData(roomsData)
    }
    if (!!socket) socket.on("allRooms", rmsListener)

    return () => {
      if (!!socket) socket.off("allRooms", rmsListener)
    }
  }, [socket])

  useEffect(() => {
    if (!!socket && !!name && !!room) {   
        socket.emit('setMeAgain', { name, room })

        return () => {
            socket.emit('unsetMe', { name, room })
        }
    }
  }, [socket, toast, name, room])

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
        <Button color='gray.500' leftIcon={<BsArrowLeft />} fontSize='sm' onClick={goChat}>Chat</Button>
        <Button color='gray.500' backgroundColor='white' fontSize='sm' onClick={handleClick}>Get All Rooms</Button>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, lg: 4 }}>
        <Card title='allUsers'>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(allUsers, null, 2)}</pre>
        </Card>
        <Card title='roomsData'>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(roomsData, null, 2)}</pre>
        </Card>
        <StatsCard
          title='In progress'
          renderer={() => (
            <div>...</div>
          )}
        />
      </SimpleGrid>
    </div>
  )
}