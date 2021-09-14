import { useEffect, useState } from 'react'
import { useMainContext } from '~/mainContext'
import { useUsersContext } from '~/usersContext'
import { useSocketContext } from '~/socketContext'
import { useToast, UseToastOptions } from "@chakra-ui/react"
import { useHistory } from 'react-router-dom'

import {
  Box,
  chakra,
  SimpleGrid,
} from '@chakra-ui/react';
import { StatsCard } from './components'

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
      <chakra.h1
        textAlign={'center'}
        fontSize={'sm'}
        py={10}
        fontWeight={'bold'}
      >
        <button onClick={goChat}>goChat</button> <button onClick={handleClick}>getAllRooms</button>
      </chakra.h1>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard
          title={'allUsers'}
          renderer={() => (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(allUsers, null, 2)}</pre>
          )}
        />
        <StatsCard
          title='roomsData'
          renderer={() => (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(roomsData, null, 2)}</pre>
          )}
        />
        <StatsCard
          title='-'
          renderer={() => (
            <div>In progress</div>
          )}
        />
      </SimpleGrid>
    </div>
  )
}