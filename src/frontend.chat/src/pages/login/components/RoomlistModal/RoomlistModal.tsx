import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  Input,
  FormLabel,
  useToast,
  List,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Text,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { useForm } from '~/common/hooks/useForm'
// import { useSocketContext } from '~/socketContext'
// import { useMainContext } from '~/mainContext'
import { RoomlistItem } from './RoomlistItem'
import { FiSearch } from 'react-icons/fi'
import { useMemo } from 'react'

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
  const displayedRooms = useMemo(() => !!formData.search ? roomlist.filter((roomName: string) => roomName.includes(formData.search)): roomlist, [roomlist, formData.search])
  const handleSubmit = () => {
    onSelectRoom(formData.search.trim())
    // resetForm()
  }

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>My rooms</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <InputGroup mb={4}>
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
            />
          </InputGroup>
          {
            displayedRooms.length > 0 ? (
              <Table variant="simple" size='md'>
                {/* <TableCaption>Imperial to metric conversion factors</TableCaption> */}
                {/* <Thead>
                  <Tr>
                    <Th>Room</Th>
                    <Th isNumeric>Action</Th>
                  </Tr>
                </Thead> */}
                <Tbody>

                  {displayedRooms.map((roomName: string) => {
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
            ) : <Text fontWeight='md'>No rooms yet...</Text>
          }
        </ModalBody>
        <ModalFooter>
          {displayedRooms.length === 0 && !!formData.search.trim() && <Button onClick={handleSubmit} color='green.500' variant='solid'>Go there</Button>}
          <Button rounded='base' onClick={onClose} variant='ghost'>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}