import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Stack,
} from '@chakra-ui/react'
import { useLocalStorage } from 'react-use'
import { useMainContext } from '~/context/mainContext'
import { getTruncated } from '~/utils/strings-ops'
// import { hasNewsInRoomlist } from '~/utils/hasNewsInRoomlist'
import { useCompare } from '~/common/hooks/useDeepEffect'
import { IoMdClose } from 'react-icons/io'

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

  const [searchRoomLS, setSearchRoomLS, _removeSearchRoomLS] = useLocalStorage<any>('chat.search-room', '')
  const [search, setSearch] = useState<string>(searchRoomLS)
  useEffect(() => {
    setSearchRoomLS(search)
  }, [search])
  const handleChange = useCallback((e) => {
    setSearch(e.target.value)
  }, [setSearch])
  const resetSearch = useCallback(() => {
    setSearch('')
  }, [setSearch])

  const MemoBtns = useMemo(() => {
    // console.log('room btns effect...', ++c)
    const roomlistLS: { name: string, ts: number }[] = JSON.parse(window.localStorage.getItem('chat.roomlist') || '[]');
    // const hasNews = hasNewsInRoomlist(roomlistLS || [], tsMap, room)
    // console.log(hasNews)

    if (!!roomlistLS && !!roomNames) {
      return <>{roomNames.filter((r) => r.includes(search.toLowerCase())).map((r: string) => {
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
    useCompare([roomNames, tsMap]),
    handleRoomClick, setRoom, resetMessages, onCloseMenuBar,
    search,
    // roomlistLS,
    room,
  ])

  return (
    !!roomlistLS ? (
      <Stack pl={0} pr={0}>
        <Grid
          templateColumns='3fr auto'
          gap={2}
        >
          <FormControl>
            <Input
              autoFocus={false}
              name='search'
              // isInvalid={!formData.userName}
              type='text'
              placeholder="Search"
              // ref={initialSetPasswdRef}
              // onKeyDown={handleKeyDownEditedMessage}
              value={search}
              onChange={handleChange}
              rounded='2xl'
              size='sm'
              variant='outline'
            />
          </FormControl>
          <IconButton
            size='sm'
            aria-label="DEL"
            colorScheme='red'
            variant='outline'
            isRound
            icon={<IoMdClose size={20} />}
            onClick={resetSearch}
            isDisabled={!search}
          >
            DEL
          </IconButton>
        </Grid>
        {MemoBtns}
      </Stack>
    ) : null
  )
}
