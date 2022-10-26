import React, { Fragment, useEffect } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Input,
  Table,
  Tbody,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
  Box,
  Flex,
  Grid,
} from '@chakra-ui/react'
import { useForm } from '~/common/hooks/useForm'
// import { useSocketContext } from '~/socketContext'
import { useMainContext } from '~/context/mainContext'
import { RoomlistItem } from './RoomlistItem'
import { FiSearch } from 'react-icons/fi'
import { useMemo } from 'react'
import { getABSortedObj } from '~/utils/sort/getABSortedObj'
import './RoomlistModal.scss'
import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { BsArrowLeft } from 'react-icons/bs'
import slugify from 'slugify'
import { useLocalStorage } from 'react-use'
import { getWords } from '~/utils/strings-ops/getWords'
import { testRoomNameByAnyWord } from '~/utils/strings-ops/testRoomNameByAnyWord'

const roomNameTest = ({ search, room }: { search: string, room: string }) => {
  const words = getWords(search)
  return testRoomNameByAnyWord({ room, words })
}

type TProps = {
  isOpened: boolean
  onClose: () => void
  onDelete: (roomName: string) => void
  roomlist: string[]
  onSelectRoom: (roomName: string) => void
}

export const RoomlistModal = ({ isOpened, onClose, roomlist, onDelete, onSelectRoom }: TProps) => {
  // const [searchRoomLS, setSearchRoomLS, _removeSearchRoomLS] = useLocalStorage<any>('chat.search-room', '')
  const { formData, handleInputChange, resetForm } = useForm({
    search: '',
  })
  // useEffect(() => {
  //   setSearchRoomLS(formData.search)
  // }, [formData.search])
  const handleClear = () => {
    resetForm()
  }
  const { name } = useMainContext()
  // const displayedRooms = useMemo(() => !!formData.search ? roomlist.filter((roomName: string) => roomName.includes(formData.search)): roomlist, [roomlist, formData.search])
  const hasStrictRoomInMyRooms = (room: string) => roomlist.includes(room)
  const handleSubmit = () => {
    if (hasStrictRoomInMyRooms(formData.search.trim())) {
      onSelectRoom(formData.search.trim())
    } else {
      onSelectRoom(`${formData.search.trim()}.${name.toLowerCase()}`)
    }
    // resetForm()
  }
  const filteredRoomList = useMemo(() => !!formData.search ? roomlist.filter((r) => roomNameTest({ room: r, search: formData.search })) : roomlist, [roomlist, formData.search])
  const roomlistAsObj = useMemo(() => getABSortedObj(filteredRoomList), [filteredRoomList])
  // const roomsKeys = useMemo(() => Object.keys(roomlistAsObj), [roomlistAsObj])
  const displayedObj = useMemo(() => !!formData.search ? getABSortedObj(filteredRoomList) : roomlistAsObj, [roomlistAsObj, filteredRoomList])
  const displayedRoomsKeys = useMemo(() => Object.keys(displayedObj).sort(), [displayedObj])

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent rounded='2xl'>
        <ModalHeader>
          <Text mb={4}>My rooms</Text>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"

              color="gray.300"
              fontSize="1.0em"
              children={<FiSearch />}
            />
            <Input
              rounded='3xl'
              name='search'
              type='text'
              placeholder="Search or Create new room"
              value={formData.search}
              // autoFocus
              onChange={handleInputChange}
              tabIndex={2}
              maxLength={30}
            />
          </InputGroup>
          {
            !!formData.search.trim() && (
              <Flex mt={2} direction='column'>
                <code>{slugify(formData.search.toLowerCase())}{!!name ? `.${name.toLowerCase()}` : ''}</code>
              </Flex>
            )
          }
        </ModalHeader>
        <ModalCloseButton tabIndex={1} rounded='3xl' />
        {displayedRoomsKeys.length > 0 && (
          <ModalBody>
            {/* !formData.search.trim() && <Text mb={10}>Название будет преобразовано</Text> */}
            {
              displayedRoomsKeys.length > 0 && (
                displayedRoomsKeys.map((key: string) => (
                  <Fragment key={key}>
                    <Heading fontFamily='Russo One' as="h2" size="md" isTruncated>&#8212; {key.toUpperCase()}</Heading>
                    <Table
                      variant="simple"
                      size='sm'
                      mb={2}
                      // style={{ width: '100%', maxWidth: '100%' }}
                    >
                      <Tbody>
                        {displayedObj[key].map((roomName: string) => {
                          const handleDel = () => {
                            const isConfirmed = window.confirm('Вы уверены? Вход только по прямой ссылке')
                            if (isConfirmed) onDelete(slugify(roomName.toLowerCase()))
                          }
                          const handleClick = () => {
                            onSelectRoom(roomName) // `${roomName}.${name.toLowerCase()}`
                          }

                          return (
                            <RoomlistItem
                              key={roomName}
                              roomName={roomName}
                              onDelete={handleDel}
                              onClick={handleClick}
                            />
                          )
                        })}
                      </Tbody>
                    </Table>
                  </Fragment>
                ))
              )
            }
          </ModalBody>
        )}
        <ModalFooter>
          <Flex style={{ width: '100%' }} justifyContent='flex-end'>
            {(!!formData.search.trim() && !hasStrictRoomInMyRooms(formData.search.trim())) && <Button size='sm' rounded='2xl' onClick={handleSubmit} color='green.500' variant='outline' leftIcon={<IoMdAdd />}>New</Button>}
            {(!!formData.search.trim()) && <Button size='sm' rounded='2xl' ml={2} onClick={handleClear} variant='ghost' leftIcon={<IoMdClose />}>Clear</Button>}
            <Button ml={2} size='sm' rounded='2xl' onClick={onClose} style={{ marginLeft: 'auto' }} variant='outline'>Close</Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}