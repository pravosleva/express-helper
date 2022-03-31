import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Stack,
} from '@chakra-ui/react'
import { useLocalStorage } from 'react-use'
import { useMainContext } from '~/context/mainContext'
import { getTruncated } from '~/utils/strings-ops'
// import { hasNewsInRoomlist } from '~/utils/hasNewsInRoomlist'

type TProps = {
  resetMessages: () => void
  onCloseMenuBar: () => void
  handleRoomClick: (room: string) => void
}

let c = 0

export const Roomlist = ({ resetMessages, onCloseMenuBar, handleRoomClick }: TProps) => {
  const [roomlistLS, _setRoomlistLS] = useLocalStorage<{ name: string, ts: number }[]>('chat.roomlist', [])
  const { name, slugifiedRoom: room, setRoom, isAdmin, tsMap } = useMainContext()
  const [roomNames, setRoomNames] = useState<string[]>([])
  
  useEffect(() => {
    const refresh = () => {
      const roomlistLS: { name: string, ts: number }[] = JSON.parse(window.localStorage.getItem('chat.roomlist') || '[]');
      const _roomNames = !!roomlistLS ? [...new Set(roomlistLS.filter(({ name }) => !!name).map(({ name }) => name))] : []

      setRoomNames(_roomNames.sort())
    }
    refresh()
  }, [name])

  const MemoBtns = useMemo(() => {
    // console.log('room btns effect...', ++c)
    const roomlistLS: { name: string, ts: number }[] = JSON.parse(window.localStorage.getItem('chat.roomlist') || '[]');
    // const hasNews = hasNewsInRoomlist(roomlistLS || [], tsMap, room)
    // console.log(hasNews)

    if (!!roomlistLS && !!roomNames) {
      return <>{roomNames.map((r: string) => {
        const tsFromLS = roomlistLS.find(({ name }) => name === r)?.ts
        const isGreen = room !== r ? (!!tsFromLS && (tsMap[r] > tsFromLS)) : false
        const label = getTruncated(r, 28)

        return (
          <Button
            justifyContent='flex-start'
            colorScheme={isGreen ? 'green' : 'gray'}
            size='sm'
            disabled={r === room}
            key={r}
            // as={IconButton}
            as={Button}
            // icon={<FiList size={18} />}
            // isRound="true"
            // mr={1}
            onClick={() => {
              handleRoomClick(r)
              setRoom(r)
              resetMessages()
              onCloseMenuBar()
            }}
          >
            {label}
          </Button>
        )
      })}</>
    }
    return []
  }, [
    JSON.stringify(roomNames), handleRoomClick, setRoom, resetMessages, onCloseMenuBar,
    JSON.stringify(tsMap),
    // roomlistLS,
    room,
  ])

  return (
    !!roomlistLS ? (
      <Stack pl={0} pr={0}>
        {MemoBtns}
      </Stack>
    ) : null
  )
}
