import { useEffect, useMemo, useState, useCallback, memo } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
} from '@chakra-ui/react'
import { useLocalStorage } from 'react-use'
import { useMainContext } from '~/context/mainContext'
import { getTruncated } from '~/utils/strings-ops'
// import { hasNewsInRoomlist } from '~/utils/hasNewsInRoomlist'
import { useCompare } from '~/common/hooks/useDeepEffect'
import { IoMdClose } from 'react-icons/io'
import { FiSearch } from 'react-icons/fi'
import { getWords } from '~/utils/strings-ops/getWords'
import { testRoomNameByAnyWord } from '~/utils/strings-ops/testRoomNameByAnyWord'
import appStyles from '~/App.module.scss'

type TProps = {
  resetMessages: () => void
  onCloseMenuBar: () => void
  handleRoomClick: (room: string) => void
}

const roomNameTest = ({ search, room }: { search: string, room: string }) => {
  const words = getWords(search)
  return testRoomNameByAnyWord({ room, words })
}

export const Roomlist = memo(({ resetMessages, onCloseMenuBar, handleRoomClick }: TProps) => {
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
      // .filter((r) => r.includes(search.toLowerCase()))
      return <>{roomNames.filter((r) => roomNameTest({ room: r, search })).map((r: string) => {
        const tsFromLS = roomlistLS.find(({ name }) => name === r)?.ts
        const hasFreshState = room !== r ? (!!tsFromLS && (tsMap[r] > tsFromLS)) : false
        // const label = getTruncated(r, 28)
        const isCurrentRoom = r === room

        return (
          <Button
            justifyContent='flex-start'
            colorScheme={hasFreshState ? 'green' : 'gray'}
            size='sm'
            disabled={isCurrentRoom}
            key={r}
            // as={IconButton}
            as={Button}
            // icon={<FiList size={18} />}
            // isRound="true"
            // mr={1}
            onClick={() => {
              if (isCurrentRoom) return

              handleRoomClick(r)
              setRoom(r)
              resetMessages()
              onCloseMenuBar()
            }}
            className={appStyles['truncate-overflow-single-line-exp']}
          >
            {isCurrentRoom ? `👉 ${r}` : r}
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
          templateColumns='1fr'
          gap={2}
        >
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.0em"
              children={<FiSearch />}
            />
            <Input
              name='search'
              type='text'
              placeholder="Search"
              value={search}
              onChange={handleChange}
              rounded='3xl'
              size='md'
              variant='outline'
            />
            {
              !!search && (
                <InputRightElement>
                  <IconButton
                    size='xs'
                    aria-label="DEL"
                    colorScheme='red'
                    variant='outline'
                    isRound
                    icon={<IoMdClose size={15} />}
                    onClick={resetSearch}
                    isDisabled={!search}
                  >
                    DEL
                  </IconButton>
                </InputRightElement>
              )
            }
          </InputGroup>
        </Grid>
        {MemoBtns}
      </Stack>
    ) : null
  )
})
