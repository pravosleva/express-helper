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
  TableCaption,
  Tbody,
  Text,
  Box,
  Stack,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useSocketContext } from '~/socketContext'
import { useMainContext } from '~/mainContext'
import { useForm } from '~/common/hooks/useForm'
import './TasklistModal.scss'
import { TaskItem } from './TaskItem'
import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { Logic } from './Logic'
import { getPrettyPrice } from '~/utils/getPrettyPrice'
import { useTasklistInRange } from '~/common/hooks/useTasklistInRange'

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

  // const logic: Logic | null = useMemo(() => !!data ? new Logic(data) : null, [data])
  // const fullSum: number = useMemo(() => logic?.fullSum || 0, [logic])
  // const useDiffTime

  const [rangeSum] = useTasklistInRange({ tasklist: data })

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
        <ModalBody pb={1} pl={1} pr={1}>
          {isCreateTaskFormOpened && (
            <Box pl={5} pr={5} pb={5}>
              <FormControl>
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
            </Box>
          )}
          {
            data.length > 0 ? (
              <Table variant="simple" size='md'>
                <TableCaption textAlign='left'>При включенной опции <span>IS&nbsp;LOOPED</span> задача начнет "гореть" через фиксированное время от создания до первого выполнения. Для сброса интервала выберите в меню <span>RESET&nbsp;LOOPER</span> и дайте новое время до выполнения.{!!rangeSum.month1 ? ` Ниже слева планируемые расходы на ближайшие месяцы` : ''}</TableCaption>
                {/* <Thead>
                  <Tr>
                    <Th>St.</Th>
                    <Th>Title</Th>
                    <Th isNumeric></Th>
                  </Tr>
                </Thead> */}
                <Tbody>
                  {data.map((data: any) => {
                    const handleCompleteToggle = () => {
                      handleTaskUpdate({ ...data, isCompleted: !data.isCompleted })
                    }
                    const handleTaskLoopToggler = () => {
                      handleTaskUpdate({ ...data, isLooped: !data.isLooped })
                    }

                    return (
                      <TaskItem
                        key={data.editTs || data.ts}
                        data={data}
                        onCompleteToggle={handleCompleteToggle}
                        onDelete={handleTaskDelete}
                        onEdit={handleTaskEdit}
                        onLoopSwitch={handleTaskLoopToggler}
                      />
                    )
                  })}
                </Tbody>
              </Table>
            ) : <Text fontWeight='md' p={5}>No tasks yet...</Text>
          }
          {/* <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data || {}, null, 2)}</pre> */}
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          {/* !!fullSum && (
            <Text marginRight='auto' fontSize="lg" fontWeight='bold'>={getPrettyPrice(fullSum)}</Text>
          ) */}
          {
            <Stack marginRight='auto'>
              {!!rangeSum.month1 && (
                <Text fontSize="sm" fontWeight='bold'>1m ={getPrettyPrice(rangeSum.month1)}</Text>
              )}
              {!!rangeSum.month3 && (
                <Text fontSize="sm" fontWeight='bold'>3m ={getPrettyPrice(rangeSum.month3)}</Text>
              )}
              {!!rangeSum.month6 && (
                <Text fontSize="sm" fontWeight='bold'>6m ={getPrettyPrice(rangeSum.month6)}</Text>
              )}
            </Stack>
          }
          {!isCreateTaskFormOpened && <Button onClick={handleCreateFormOpen} leftIcon={<IoMdAdd />}>Add task</Button>}
          {isCreateTaskFormOpened && <Button onClick={handleCreateFormClose} leftIcon={<IoMdClose />}>Cancel</Button>}
          {isCreateTaskFormOpened && !!formData.title && <Button onClick={handleCreateSubmit} color='green.500' variant='solid'>Create</Button>}
          <Button onClick={onClose} variant='ghost' color='red.500'>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}