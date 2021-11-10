import React, { Fragment } from 'react'
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
} from '@chakra-ui/react'
import { useForm } from '~/common/hooks/useForm'
// import { useSocketContext } from '~/socketContext'
// import { useMainContext } from '~/mainContext'
import { RoomlistItem } from './RoomlistItem'
import { FiSearch } from 'react-icons/fi'
import { useMemo } from 'react'
import { getABSortedObj } from '~/utils/sort/getABSortedObj'
import './RoomlistModal.scss'
import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { BsArrowLeft } from 'react-icons/bs'

type TProps = {
  isOpened: boolean
  onClose: () => void
  onDelete: (roomName: string) => void
  roomlist: string[]
  onSelectRoom: (roomName: string) => void
}

export const RoomlistModal = ({ isOpened, onClose, roomlist, onDelete, onSelectRoom }: TProps) => {
  const { formData, handleInputChange, resetForm } = useForm({
    search: '',
  })
  const handleClear = () => {
    resetForm()
  }
  const displayedRooms = useMemo(() => !!formData.search ? roomlist.filter((roomName: string) => roomName.includes(formData.search)): roomlist, [roomlist, formData.search])
  const handleSubmit = () => {
    onSelectRoom(formData.search.trim())
    // resetForm()
  }
  const roomlistAsObj = useMemo(() => getABSortedObj(roomlist), [roomlist])
  // const roomsKeys = useMemo(() => Object.keys(roomlistAsObj), [roomlistAsObj])
  const displayedObj = useMemo(() => !!formData.search ? getABSortedObj(roomlist, formData.search) : roomlistAsObj, [roomlistAsObj, formData.search])
  const displayedRoomsKeys = useMemo(() => Object.keys(displayedObj).sort(), [displayedObj])

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text mb={4}>My rooms</Text>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"

              color="gray.300"
              fontSize="1.2em"
              children={<FiSearch />}
            />
            <Input
              name='search'
              type='text'
              placeholder="Search"
              value={formData.search}
              // autoFocus
              onChange={handleInputChange}
              tabIndex={2}
            />
          </InputGroup>
        </ModalHeader>
        <ModalCloseButton tabIndex={1} />
        <ModalBody pb={6}>
          {
            displayedRoomsKeys.length > 0 && (
              displayedRoomsKeys.map((key: string) => (
                <Fragment key={key}>
                  <Heading fontFamily='Russo One' as="h2" size="md" isTruncated>&#8212; {key.toUpperCase()}</Heading>
                  <Table variant="simple" size='sm' mb={2}>
                    <Tbody>
                      {displayedObj[key].map((roomName: string) => {
                        const handleDel = () => {
                          onDelete(roomName)
                        }
                        const handleClick = () => {
                          onSelectRoom(roomName)
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
        <ModalFooter className='btns-box'>
          {displayedRooms.length === 0 && !!formData.search.trim() && <Button onClick={handleSubmit} color='green.500' variant='solid' leftIcon={<IoMdAdd />}>Go there</Button>}
          {!!formData.search.trim() && <Button rounded='base' onClick={handleClear} variant='ghost' leftIcon={<IoMdClose />}>Clear</Button>}
          <Button rounded='base' onClick={onClose} variant='ghost'>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}