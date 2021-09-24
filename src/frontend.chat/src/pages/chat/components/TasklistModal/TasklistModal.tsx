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
} from '@chakra-ui/react'
import { useState } from 'react'
import { useSocketContext } from '~/socketContext'
import { useMainContext } from '~/mainContext'
import { useForm } from '~/common/hooks/useForm'
import './TasklistModal.scss'
import { TaskItem } from './TaskItem'

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
      }
    })
  }
  const handleTaskUpdate = (newData: any) => {
    console.log(newData)
    if (!!socket) socket?.emit('updateTask', { room, ...newData }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      }
    })
  } 

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tasklist</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isCreateTaskFormOpened && (
            <>
              <FormControl mt={4} mb={4}>
                <FormLabel>Title</FormLabel>
                <Input
                  name='title'
                  isInvalid={!formData.title}
                  type='text'
                  placeholder="Title"
                  // ref={initialSetPasswdRef}
                  // onKeyDown={handleKeyDownEditedMessage}
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </FormControl>
            </>
          )}
          {
            data.length > 0 && (
              <List spacing={3}>
                {data.map((data: any) => {
                  const handleClick = () => {
                    handleTaskUpdate({ ...data, isCompleted: !data.isCompleted })
                  }

                  return (
                    <TaskItem
                      key={data.editTs || data.ts}
                      data={data}
                      click={handleClick}
                    />
                  )
                })}
              </List>
            )
          }
          {/* <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data || {}, null, 2)}</pre> */}
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          {!isCreateTaskFormOpened && <Button onClick={handleCreateFormOpen}>Add task</Button>}
          {isCreateTaskFormOpened && <Button onClick={handleCreateFormClose}>Cancel</Button>}
          {isCreateTaskFormOpened && !!formData.title && <Button onClick={handleCreateSubmit}>Create</Button>}
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}