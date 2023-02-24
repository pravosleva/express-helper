import { useState, useCallback, useMemo, memo } from 'react'
import { useSocketContext } from '~/context/socketContext'
import { useMainContext } from '~/context/mainContext'
import {
  Box,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Table,
  TableCaption,
  Tbody,
  Text,
  Stack,
  RadioGroup,
  Radio,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useColorMode,
  Thead,
  Tr,
  Th,
  Divider,
  Flex,
} from '@chakra-ui/react'
import { useForm } from '~/common/hooks/useForm'
import { TaskItem } from '../../TaskItem'
import { PriceModal } from '../PriceModal'
import { TotalSum } from '../TotalSum'
import { IoMdAdd, IoMdClose } from 'react-icons/io'
import styles from './TasklistContent.module.scss'
import clsx from 'clsx'
import { useCompare } from '~/common/hooks/useDeepEffect'
import { getABSortedObjByObjects } from './getABSortedObjByObjects'
import { ResponsiveSearchField } from './components'

type TProps = {
  data: any[]
  asModal?: boolean
  modalHeader?: string
}

type TMemoizedGroupProps = {
  asModal: boolean;
  colorMode: any;
  abDataVersion: any;
  char: any;
  radioValue: any;
  handleCompleteToggle: any;
  handleTaskLoopToggler: any;
  handleOpenPriceModal: any;
  handleResetExpenses: any;
  handleTaskDelete: any;
  handleTaskEdit: any;
}

const MemoizedGroup = memo(({
  asModal,
  colorMode, // mode.colorMode
  abDataVersion,
  char: key, // key
  radioValue,
  handleCompleteToggle,
  handleTaskLoopToggler,
  handleOpenPriceModal,
  handleResetExpenses,
  handleTaskDelete,
  handleTaskEdit,
}: TMemoizedGroupProps) => {
  return (
    <div>
      {asModal && <Divider marginTop="0px" marginBottom='0px' />}

      <Flex direction='column'>

        <div className={clsx(styles.abHeader, styles[`abHeader_${colorMode}`], { [styles[`abHeader_topRadius`]]: !asModal })}>
          {key.toUpperCase()}
        </div>
        
        <div style={{ zIndex: 1 }} className={clsx(styles.itemsList)}>
          {abDataVersion[key].map((data: any) => {
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
                char={key}
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
        </div>
      </Flex>
    </div>
  )
})

export const _TasklistContent = ({ data, asModal, modalHeader }: TProps) => {
  const { socket } = useSocketContext()
  const { room } = useMainContext()
  const toast = useToast()
  const [isCreateTaskFormOpened, setIsCreateTaskFormOpened] = useState<boolean>(false)
  const handleCreateFormOpen = useCallback(() => {
    setIsCreateTaskFormOpened(true)
  }, [setIsCreateTaskFormOpened])
  const handleCreateFormClose = useCallback(() => {
    setIsCreateTaskFormOpened(false)
  }, [setIsCreateTaskFormOpened])
  const { formData, handleInputChange, resetForm } = useForm({
    title: '',
  })
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
  const handkeKeyUp = useCallback((ev: any) => {
    if (ev.keyCode === 13) {
      if (!!room) handleCreateSubmit()
    }
  }, [handleCreateSubmit])
  const [radioValue, setRadioValue] = useState<string>('unchecked')
  const completedTasksLen = useMemo(() => !!data ? data.filter(({ isCompleted }: any) => isCompleted).length : 0, [useCompare([data])])
  const percentage = useMemo(() => {
    if (!data || data.length === 0) return 0

    const all = data.length
    const completed = completedTasksLen

    return Math.round(completed * 100 / all)
  }, [useCompare([data]), completedTasksLen])
  const MemoCurrentShortStateByRadio = useMemo(() => {
    if (!data) return null
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
  }, [radioValue, completedTasksLen, useCompare([data])])
  const handleCompleteToggle = useCallback((data: any) => {
    handleTaskUpdate({ ...data, isCompleted: !data.isCompleted })
  }, [handleTaskUpdate])
  const handleTaskLoopToggler = useCallback((data: any) => {
    handleTaskUpdate({ ...data, isLooped: !data.isLooped })
  }, [handleTaskUpdate])
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
  }, [handleTaskEdit, editedTask2, handleClosePriceModal])
  const handleResetExpenses = useCallback(() => {
    handleTaskEdit({ ...editedTask2, price: 0 })
  }, [handleTaskEdit, editedTask2])
  // --

  const [searchString, setSearchString] = useState<string>('')
  const handleSearchChange = useCallback((e) => {
    console.log(e.target.value)
    setSearchString(e.target.value)
  }, [setSearchString])
  const handleSearchClear = useCallback(() => {
    setSearchString('')
  }, [setSearchString])
  const abDataVersion = useMemo(() => getABSortedObjByObjects({ arr: data, substr: searchString }), [data, searchString])

  const Controls = useMemo(() => {
    return (
      <>
        {
          !isCreateTaskFormOpened && <TotalSum />
        }
        {!isCreateTaskFormOpened && <Button size='sm' rounded='2xl' onClick={handleCreateFormOpen} leftIcon={<IoMdAdd />}>New</Button>}
        {isCreateTaskFormOpened && <Button size='sm' rounded='2xl' onClick={handleCreateFormClose} leftIcon={<IoMdClose />}>Cancel</Button>}
        {isCreateTaskFormOpened && !!formData.title && <Button size='sm' rounded='2xl' onClick={handleCreateSubmit} color='green.500' variant='solid'>Create</Button>}
        {/* <Button size='sm' rounded='2xl' onClick={onClose} variant='ghost' color='red.500'>Close</Button> */}
      </>
    )
  }, [isCreateTaskFormOpened, formData.title, handleCreateFormOpen, handleCreateFormClose, handleCreateSubmit])
  const mode = useColorMode()
  const EnterText = useMemo(() => {
    return (
      <>
        {isCreateTaskFormOpened && (
          <Box pl={5} pr={5} pb={5} mt={3}>
            <FormControl>
              {/* <FormLabel>Title</FormLabel> */}
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
      </>
    )
  }, [isCreateTaskFormOpened, formData.title, handleInputChange, handkeKeyUp])
  const Body = useMemo(() => {
    return (
      <>
        {
          !asModal && (
            <Box
              pl={5}
              pr={5}
              className={clsx(styles['control-box'], styles['sticky-header'], styles[`themed-bg_${mode.colorMode}`], styles[`themed-bg_${mode.colorMode}_backdrop-blur`], styles[`themed-bordered_${mode.colorMode}`])}
            >
              <Stack>
                <Box
                  fontWeight='bold'
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  {data?.length > 0 ? <span style={{ color: 'var(--chakra-colors-green-400)' }}>{percentage}%</span> : ''}
                  {MemoCurrentShortStateByRadio}
                  {data?.length > 0 ? <>{completedTasksLen} of {data.length}</> : ''}
                </Box>
                <Box
                  pl={5}
                  pr={5}
                >
                  <ResponsiveSearchField
                    initialState={searchString}
                    onChange={handleSearchChange}
                    onClear={handleSearchClear}
                  />
                </Box>
                <Box>
                  <RadioGroup onChange={setRadioValue} value={radioValue}>
                    <Stack direction='row' justifyContent='center'>
                      <Radio value='all'>All</Radio>
                      <Radio value='checked'>Checked</Radio>
                      <Radio value='unchecked'>Unchecked</Radio>
                    </Stack>
                  </RadioGroup>
                </Box>
              </Stack>
              {EnterText}
            </Box>
          )
        }
        {asModal && (
          <>
            {EnterText}
          </>
        )}
        {/*
          data?.length > 0 ? (
            <div>
              <Table variant="simple" size='md'>
                <TableCaption mt={5} mb={5} textAlign='left'>При включенной опции <b>IS&nbsp;LOOPED</b> готовая задача будет работать как циклический таймер, сообщая о своей готовности быть unchecked через промежуток времени от создания до первого выполнения. Для сброса интервала выберите в меню <b>RESET&nbsp;LOOPER</b> и дайте новое время до выполнения</TableCaption>
                <Thead>
                  <Tr>
                    <Th>St.</Th>
                    <Th>Title</Th>
                    <Th isNumeric></Th>
                  </Tr>
                </Thead>
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
            </div>
          ) : <Text fontWeight='md' p={5}>No tasks yet...</Text>
        */}
        <Text fontWeight='md' p={5}>При включенной опции <b>IS&nbsp;LOOPED</b> готовая задача будет работать как циклический таймер, сообщая о своей готовности быть unchecked через промежуток времени от создания до первого выполнения. Для сброса интервала выберите в меню <b>RESET&nbsp;LOOPER</b> и дайте новое время до выполнения</Text>
        
        {/* <pre>{JSON.stringify(abDataVersion, null, 2)}</pre> */}
        {
          Object.keys(abDataVersion).length > 0 ? (
            <div>
              {Object.keys(abDataVersion).map((key: string) => {
                switch (radioValue) {
                  case 'all': break;
                  case 'checked':
                    // if (!data.isCompleted) return null;
                    if (abDataVersion[key].every((data) => !data.isCompleted)) return null;
                    break;
                  case 'unchecked':
                    // if (data.isCompleted) return null;
                    if (abDataVersion[key].every((data) => data.isCompleted)) return null;
                    break;
                  default: break;
                }

                return (
                  <MemoizedGroup
                    key={key}
                    asModal={asModal || false}
                    colorMode={mode.colorMode}
                    abDataVersion={abDataVersion}
                    char={key}
                    radioValue={radioValue}
                    handleCompleteToggle={handleCompleteToggle}
                    handleTaskLoopToggler={handleTaskLoopToggler}
                    handleOpenPriceModal={handleOpenPriceModal}
                    handleResetExpenses={handleResetExpenses}
                    handleTaskDelete={handleTaskDelete}
                    handleTaskEdit={handleTaskEdit}
                  />
                )
              })}
            </div>
          ) : <Text fontWeight='md' p={5}>No tasks yet...</Text>
        }
      </>
    )
  }, [
    mode.colorMode,
    asModal,
    percentage,
    completedTasksLen,
    useCompare([data]),
    MemoCurrentShortStateByRadio,
    isCreateTaskFormOpened,
    formData.title,
    handleCompleteToggle,
    handleInputChange,
    handkeKeyUp,
    handleTaskDelete,
    handleTaskEdit,
    handleOpenPriceModal,
    handleResetExpenses,
    abDataVersion,
  ])

  return (
    <>
      <PriceModal
        key={editedTask2?.price || 'no-price'}
        isOpened={isPriceModalOpened}
        onClose={handleClosePriceModal}
        onSubmit={handlePriceModalSubmit}
        initialPrice={editedTask2?.price || 0}
      />
      {
        asModal && !!data && (
          <ModalHeader>
            {modalHeader || null}
            <Box>
              <Stack>
                <Box>
                  {data.length > 0 ? <><span style={{ color: 'var(--chakra-colors-green-400)' }}>{percentage}%</span> | {completedTasksLen} of {data.length} |</> : ''} {MemoCurrentShortStateByRadio}
                </Box>
                <Box
                  pt={2}
                  pb={2}
                >
                  <ResponsiveSearchField
                    initialState={searchString}
                    onChange={handleSearchChange}
                    onClear={handleSearchClear}
                  />
                </Box>
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
            </Box>
          </ModalHeader>
        )
      }
      {
        asModal
        ? (
          <>
            <ModalBody pb={0} pl={0} pr={0} pt={0}>
              {Body}
            </ModalBody>
          </>
        ) : Body
      }
      {
        asModal
        ? (
          <>
            <ModalFooter className={clsx(styles['modal-footer-btns-wrapper'])}>
              {Controls}
            </ModalFooter>
          </>
        ) : (
          <Box
            pl={5}
            pr={5}
            className={clsx(styles['modal-footer-btns-wrapper'], styles['control-box'], styles['sticky-footer'], styles[`themed-bg_${mode.colorMode}`], styles[`themed-bg_${mode.colorMode}_backdrop-blur`], styles[`themed-bordered_${mode.colorMode}`])}>
            {Controls}
          </Box>
        )
      }
    </>
  )
}

export const TasklistContent = memo(_TasklistContent)
