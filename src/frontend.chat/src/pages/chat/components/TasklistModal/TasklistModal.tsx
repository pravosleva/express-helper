// @ts-ignore
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
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
  Switch,
  Stack,
  RadioGroup,
  Radio,
} from '@chakra-ui/react'
import { useSocketContext } from '~/socketContext'
import { useMainContext } from '~/mainContext'
import { useForm } from '~/common/hooks/useForm'
import './TasklistModal.scss'
import { TaskItem } from './TaskItem'
import { IoMdAdd, IoMdClose } from 'react-icons/io'
import { TotalSum } from './components/TotalSum'
import { DatepickerModal } from './components/DatepickerModal'

type TProps = {
  isOpened: boolean
  onClose: () => void
  data: any
}

export const TasklistModal = ({ isOpened, onClose, data }: TProps) => {
  // const [isPending, startTransition] = useTransition();
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
  const handleCreateSubmit = useCallback(() => {
    if (!!socket) socket?.emit('createTask', { room, title: formData.title }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      } else {
        resetForm()
        handleCreateFormClose()
      }
    })
  }, [room, formData.title, resetForm, handleCreateFormClose])
  const handleTaskUpdate = useCallback((newData: any) => {
    if (!!socket) socket?.emit('updateTask', { room, ...newData }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      }
    })
  }, [socket, room])
  const handleTaskDelete = useCallback((ts: number) => {
    if (!!socket) socket?.emit('deleteTask', { room, ts }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      }
    })
  }, [socket, room])
  const handleTaskEdit = useCallback((newData: any) => {
    if (!!socket) socket?.emit('updateTask', { room, ...newData }, (errMsg?: string) => {
      if (!!errMsg) {
        toast({ title: errMsg, status: 'error', duration: 5000, isClosable: true })
      }
    })
  }, [socket, room])
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

  const handleCompleteToggle = useCallback((data: any) => {
    handleTaskUpdate({ ...data, isCompleted: !data.isCompleted })
  }, [handleTaskUpdate])
  const handleTaskLoopToggler = useCallback((data: any) => {
    handleTaskUpdate({ ...data, isLooped: !data.isLooped })
  }, [handleTaskUpdate])

  // const [isUncheckedOnlyEnabled, setIsUncheckedOnlyEnabled] = useState<boolean>(false)
  // const toggleUncheckedSwitch = useCallback((e) => {
  //   setIsUncheckedOnlyEnabled(e.target.checked)
  // }, [setIsUncheckedOnlyEnabled])

  const [radioValue, setRadioValue] = useState<string>('unchecked')

  useEffect(() => {
    console.log(radioValue)
  }, [radioValue])

  const [initialUncheckedTs, setInitialUncheckedTs] = useState<number>(0)
  const [isDatepickerOpened, setIsDatepickerOpened] = useState<boolean>(false)
  const editedTask = useRef<any>({})
  const handleOpenDatePicker = useCallback((data: any) => {
    setIsDatepickerOpened(true)
    editedTask.current = data
    if (!!data.uncheckTsList[0]) {
      setInitialUncheckedTs(data.uncheckTsList[0])
    } else {
      setInitialUncheckedTs(Date.now())
    }
  }, [setIsDatepickerOpened, setInitialUncheckedTs])
  const handleCloseDatePicker = useCallback(() => {
    setIsDatepickerOpened(false)
  }, [setIsDatepickerOpened])

  const onUpdateFirstDate = (selectedTs: number) => {
    console.log('SELECTED DATE:', selectedTs)

    if (!selectedTs) {
      console.log('ERR#1')
      console.log(selectedTs)
      return
    }

    console.log('BEFORE: editedTask.current.uncheckTsList[0]')
    console.log(editedTask.current.uncheckTsList[0])

    let newFixedDiffTs
    switch (true) {
      case !!editedTask.current:
          if (!!editedTask.current.checkTsList) {
            newFixedDiffTs = editedTask.current.checkTsList[0] - selectedTs
          } else {
            newFixedDiffTs = editedTask.current.checkTsList = [Date.now() - selectedTs]
          }
          
          break;
      default: break;
    }
    // editedTask.current.uncheckTsList = [selectedTs]

    console.log('AFTER: editedTask.current.checkTsList[0]')
    console.log(editedTask.current.checkTsList[0])

    if (!newFixedDiffTs) {
      console.log('ERR#2')
      console.log(editedTask.current)
      return
    }

    handleTaskUpdate({ ...editedTask.current, newFixedDiffTs })
  }

  return (
    <>
      <DatepickerModal
        isOpened={isDatepickerOpened && !!initialUncheckedTs}
        onClose={handleCloseDatePicker}
        onSubmit={onUpdateFirstDate}
        initialUncheckedTs={initialUncheckedTs}
        // content={() => (
        //   <pre>{JSON.stringify(editedTask.current, null, 2)}</pre>
        // )}
      />
      <Modal
        size="sm"
        isOpen={isOpened}
        onClose={onClose}
        scrollBehavior='inside'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Stack>
              <Box>Tasklist{data.length > 0 ? ` ${percentage}% (${completedTasksLen} of ${data.length})` : ''}</Box>
              {/* <Box>
                <FormControl display='flex' alignItems='center'>
                  <Switch id='tasklist-unchecked-only-switcher' mr={3} onChange={toggleUncheckedSwitch} isChecked={isUncheckedOnlyEnabled} />
                  <FormLabel htmlFor='tasklist-unchecked-only-switcher' mb='0'>
                    Unchecked only
                  </FormLabel>
                </FormControl>
              </Box> */}
              <Box>
                <RadioGroup onChange={setRadioValue} value={radioValue}>
                  <Stack direction='row'>
                    <Radio value='all'>All</Radio>
                    <Radio value='checked'>Checked only</Radio>
                    <Radio value='unchecked'>Unchecked only</Radio>
                  </Stack>
                </RadioGroup>
              </Box>
            </Stack>
          </ModalHeader>
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
                  <TableCaption mt={5} mb={5} textAlign='left'>При включенной опции <b>IS&nbsp;LOOPED</b> готовая задача будет работать как циклический таймер, сообщая о своей готовности быть unchecked через промежуток времени от создания до первого выполнения. Для сброса интервала выберите в меню <b>RESET&nbsp;LOOPER</b> и дайте новое время до выполнения</TableCaption>
                  {/* <Thead>
                    <Tr>
                      <Th>St.</Th>
                      <Th>Title</Th>
                      <Th isNumeric></Th>
                    </Tr>
                  </Thead> */}
                  <Tbody>
                    {data.map((data: any) => {
                      switch (radioValue) {
                        case 'all': break;
                        case 'checked':
                          if (!data.isCompleted) return null;
                          break;
                        case 'unchecked':
                          if (data.isCompleted) return null;
                          break;
                        default: break;
                      }

                      return (
                        <TaskItem
                          key={data.editTs || data.ts}
                          data={data}
                          onCompleteToggle={() => {
                            handleCompleteToggle(data)
                          }}
                          onDelete={handleTaskDelete}
                          onEdit={handleTaskEdit}
                          onLoopSwitch={() => {
                            handleTaskLoopToggler(data)
                          }}
                          onOpenDatePicker={handleOpenDatePicker}
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
              !isCreateTaskFormOpened && <TotalSum />
            }
            {!isCreateTaskFormOpened && <Button onClick={handleCreateFormOpen} leftIcon={<IoMdAdd />}>New</Button>}
            {isCreateTaskFormOpened && <Button onClick={handleCreateFormClose} leftIcon={<IoMdClose />}>Cancel</Button>}
            {isCreateTaskFormOpened && !!formData.title && <Button onClick={handleCreateSubmit} color='green.500' variant='solid'>Create</Button>}
            <Button onClick={onClose} variant='ghost' color='red.500'>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}