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
// import { DatepickerModal } from './components/DatepickerModal'
import { PriceModal } from './components'
// import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'

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

  // -- NOTE: DATEPICKER MODAL
  // TODO: IN PROGRESS
  /*
  const [initialUncheckedTs, setInitialUncheckedTs] = useState<number>(0)
  const [isDatepickerOpened, setIsDatepickerOpened] = useState<boolean>(false)
  const editedTask = useRef<any>(null)
  const handleOpenDatePicker = useCallback((data: any) => {
    editedTask.current = data
    setInitialUncheckedTs(data.uncheckTsList[0])
    setIsDatepickerOpened(true)
  }, [setIsDatepickerOpened, setInitialUncheckedTs])
  const handleCloseDatePicker = useCallback(() => {
    setIsDatepickerOpened(false)
  }, [setIsDatepickerOpened])

  const onUpdateFirstDate = (selectedTs: number) => {
    console.log('SELECTED DATE:', selectedTs)
    console.log('BEFORE: editedTask.current.uncheckTsList[0]')
    console.log(editedTask.current.uncheckTsList[0])
    const newData = { ...editedTask.current }

    newData.uncheckTsList = [selectedTs]

    if (!!newData.checkTsList) {
      console.log('CASE 1')
      newData.checkTsList = [newData.uncheckTsList[0] + editedTask.current.fixedDiffTs]
    } else {}

    console.log('AFTER: editedTask.current.checkTsList[0]')
    console.log(editedTask.current.uncheckTsList[0])

    handleTaskUpdate({ ...newData, updateFirstDateOnly: true })
  }
  */
  // --

  // -- NOTE: PRICE MODAL
  // const activeTaskRef = useRef<any>(null)
  const [editedTask2, setEditedTask2] = useState<any>(null)
  const [isPriceModalOpened, setIsPriceModalOpened] = useState<boolean>(false)
  const handleOpenPriceModal = useCallback((data: any) => {
    setEditedTask2(data) 
    setIsPriceModalOpened(true)
  }, [setIsPriceModalOpened, setEditedTask2])
  const handleClosePriceModal = useCallback(() => {
    setIsPriceModalOpened(false)
  }, [setIsPriceModalOpened])
  const handlePriceModalSubmit = useCallback((price: number) => {
    if (!!editedTask2 && Number.isInteger(price)) {
      handleTaskEdit({ ...editedTask2, price })
      handleClosePriceModal()
    } else {
      toast({ title: 'ERR#1', description: 'FUCKUP COND: !!activeTaskRef.current && Number.isInteger(price)', status: 'error', duration: 5000, isClosable: true })
    }
  }, [handleTaskEdit, editedTask2])
  const handleResetExpenses = useCallback(() => {
    handleTaskEdit({ ...editedTask2, price: 0 })
  }, [handleTaskEdit, editedTask2])
  // --

  const MemoCurrentShortStateByRadio = useMemo(() => {
    switch(radioValue) {
      case 'checked': return (
        <span style={{ color: 'var(--chakra-colors-blue-400)' }}>Done: {completedTasksLen}</span>
      )
      case 'unchecked': return (
        <span style={{ color: 'var(--chakra-colors-blue-400)' }}>In progress: {data.length - completedTasksLen}</span>
      )
      default: return ( // all
        <span style={{ color: 'var(--chakra-colors-blue-400)' }}>Total: {data.length}</span>
      )
    }
  }, [radioValue, completedTasksLen, data.length])

  return (
    <>
      <PriceModal
        key={editedTask2?.price || 'no-price'}
        isOpened={isPriceModalOpened}
        onClose={handleClosePriceModal}
        onSubmit={handlePriceModalSubmit}
        initialPrice={editedTask2?.price || 0}
      />
      {/*
      <DatepickerModal
        // key={initialUncheckedTs}
        isOpened={isDatepickerOpened && !!initialUncheckedTs}
        onClose={handleCloseDatePicker}
        onSubmit={onUpdateFirstDate}
        initialUncheckedTs={initialUncheckedTs}
        // content={() => (
        //   <pre>{JSON.stringify(editedTask.current, null, 2)}</pre>
        // )}
      /> */}
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
              <Box>
                {data.length > 0 ? <><span style={{ color: 'var(--chakra-colors-green-400)' }}>{percentage}%</span> ({completedTasksLen} of {data.length})</> : ''} {MemoCurrentShortStateByRadio}
              </Box>
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
                          // onOpenDatePicker={handleOpenDatePicker}
                          onOpenDatePicker={() => { console.log('Datepicker in progress...') }}

                          onPriceModalOpen={handleOpenPriceModal}
                          onResetExpenses={handleResetExpenses}
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