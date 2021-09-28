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
  Table,
  // TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Text,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useSocketContext } from '~/socketContext'
import { useMainContext } from '~/mainContext'
import { useForm } from '~/common/hooks/useForm'
import './TasklistModal.scss'
import { TaskItem } from './TaskItem'
import { IoMdAdd, IoMdClose } from 'react-icons/io'

type TProps = {
  isOpened: boolean
  onClose: () => void
  data: any
}

export const TasklistModal = ({ isOpened, onClose, data }: TProps) => {
  const [isCreateTaskFormOpened, setIsCreateTaskFormOpened] = useState<boolean>(false)
  const handleCreateFormOpen = () => {
    setIsCreateTaskFormOpened(true)
  }
  const handleCreateFormClose = () => {
    setIsCreateTaskFormOpened(false)
  }
  const { formData, handleInputChange, resetForm } = useForm({
    title: '',
  })
  const { socket } = useSocketContext()
  const { room } = useMainContext()
  const toast = useToast()
  const handleCreateSubmit = () => {
    if (!!socket) socket?.emit('createTask', { room, title: formData.title }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      } else {
        resetForm()
        handleCreateFormClose()
      }
    })
  }
  const handleTaskUpdate = (newData: any) => {
    if (!!socket) socket?.emit('updateTask', { room, ...newData }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      }
    })
  }
  const handleTaskDelete = (ts: number) => {
    if (!!socket) socket?.emit('deleteTask', { room, ts }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      }
    })
  }
  const handleTaskEdit = (newData: any) => {
    if (!!socket) socket?.emit('updateTask', { room, ...newData }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      }
    })
  }
  const handkeKeyUp = (ev: any) => {
    if (ev.keyCode === 13) {
      if (!!room) handleCreateSubmit()
    }
  }

  const completedTasksLen = useMemo(() => data.filter(({ isCompleted }: any) => isCompleted).length, [JSON.stringify(data)])
  const percentage = useMemo(() => {
    if (data.length === 0) return 0

    const all = data.length
    const completed = completedTasksLen

    return Math.round(completed * 100 / all)
  }, [data, completedTasksLen])

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tasklist{data.length > 0 ? ` ${percentage}% (${completedTasksLen} of ${data.length})` : ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isCreateTaskFormOpened && (
            <>
              <FormControl mt={4} mb={4}>
                <FormLabel>Title</FormLabel>
                <Input
                  autoFocus
                  name='title'
                  isInvalid={!formData.title}
                  type='text'
                  placeholder="Title"
                  // ref={initialSetPasswdRef}
                  // onKeyDown={handleKeyDownEditedMessage}
                  value={formData.title}
                  onChange={handleInputChange}
                  onKeyUp={handkeKeyUp}
                />
              </FormControl>
            </>
          )}
          {
            data.length > 0 ? (
              <Table variant="simple" size='md'>
                {/* <TableCaption>Imperial to metric conversion factors</TableCaption> */}
                <Thead>
                  <Tr>
                    <Th>Status</Th>
                    <Th>Title</Th>
                    <Th isNumeric>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map((data: any) => {
                    const handleCompleteToggle = () => {
                      handleTaskUpdate({ ...data, isCompleted: !data.isCompleted })
                    }

                    return (
                      <TaskItem
                        key={data.editTs || data.ts}
                        data={data}
                        onCompleteToggle={handleCompleteToggle}
                        onDelete={handleTaskDelete}
                        onEdit={handleTaskEdit}
                      />
                    )
                  })}
                </Tbody>
              </Table>
            ) : <Text fontWeight='md'>No tasks yet...</Text>
          }
          {/* <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data || {}, null, 2)}</pre> */}
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          {!isCreateTaskFormOpened && <Button onClick={handleCreateFormOpen} leftIcon={<IoMdAdd />}>Add task</Button>}
          {isCreateTaskFormOpened && <Button onClick={handleCreateFormClose} leftIcon={<IoMdClose />}>Cancel</Button>}
          {isCreateTaskFormOpened && !!formData.title && <Button onClick={handleCreateSubmit} color='green.500' variant='solid'>Create</Button>}
          <Button onClick={onClose} variant='ghost' color='red.500'>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}