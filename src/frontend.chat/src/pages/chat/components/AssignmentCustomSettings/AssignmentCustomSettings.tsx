import { useState, useCallback, useMemo } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  Button,
  Stack,
  Flex,
  Text,
  Grid,
} from '@chakra-ui/react'
import { useDebounce, useLocalStorage } from 'react-use'
import { SearchUserModal } from '~/pages/chat/components/SearchUserModal'
import { CgSearch, CgAssign } from 'react-icons/cg'
import { getTruncated } from '~/utils/strings-ops'
import { IoMdClose } from 'react-icons/io'
import { FaTrashAlt, FaCheck } from 'react-icons/fa'
import { AiOutlineFire } from 'react-icons/ai'
import { FiActivity } from 'react-icons/fi'
import { EMessageStatus, TMessage } from '~/utils/interfaces'

type TSetting = {
  name: string
  ts: number
}
type TProps = {
  onAddAssignedToFilters: (name: string) => void
  onRemoveAssignedToFilters: (name: string) => void
  logic: any
  assignmentExecutorsFilters: string[]
  onResetFilters: () => void
  onSetFilters: (statuses: EMessageStatus[]) => void
  activeFilters: EMessageStatus[]
}

export const AssignmentCustomSettings = ({
  logic,
  onAddAssignedToFilters,
  onRemoveAssignedToFilters,
  assignmentExecutorsFilters,
  onResetFilters,
  onSetFilters,
  activeFilters,
}: TProps) => {
  const [settingsLS, setSettingsLS] = useLocalStorage<{ [key: string]: TSetting }>('chat.assignment-feature.custom-settings', {})
  const [isUsersSearchModalOpened, setIsUsersSearchModalOpened] = useState<boolean>(false)
  const toggleSearchModal = useCallback(() => {
    setIsUsersSearchModalOpened((s) => !s)
  }, [setIsUsersSearchModalOpened])
  const handleCloseSearchModal = useCallback(() => {
    setIsUsersSearchModalOpened(false)
  }, [setIsUsersSearchModalOpened])
  const handleAddtUser = useCallback((userName: string) => {
    const newItem = { name: userName }
    const newState = !!settingsLS ? { ...settingsLS } : {}
    const ts = Date.now()
  
    newState[newItem.name] = { name: userName, ts }

    setSettingsLS(newState)
    handleCloseSearchModal()
  }, [settingsLS, setSettingsLS, handleCloseSearchModal])
  const handleRemoveUser = useCallback((name: string) => {
    const isConfirmed = window.confirm(`Вы уверены? Пользователь ${name} будет удален из списка`)

    if (!isConfirmed) return

    if (assignmentExecutorsFilters.includes(name)) onRemoveAssignedToFilters(name)

    const newState: {[key: string]: { name: string, ts: number }} = {}
    for (const key in settingsLS) {
      if (key !== name) newState[key] = settingsLS[key]
    }

    setSettingsLS(newState)
  }, [assignmentExecutorsFilters, onRemoveAssignedToFilters, settingsLS])

  const users = useMemo(() => !!settingsLS ? Object.keys(settingsLS) : [], [settingsLS])
  const handleUserFilterClick = useCallback((name: string) => {
    console.log(name)
    if (assignmentExecutorsFilters.includes(name)) {
      onRemoveAssignedToFilters(name)
    } else {
      onAddAssignedToFilters(name)
    }
  }, [assignmentExecutorsFilters])
  const countersMap = useMemo(() => {
    const res: {[key: string]: { total: number }} = {}

    for (const key in settingsLS) {
      res[key] = {
        total: logic.getAssignmentCounterExecutor(key),
      }
    }

    return res
  }, [logic, settingsLS])
  const hasEnabledFilters = assignmentExecutorsFilters.length > 0
  const dangerCounter = useMemo(() => logic.getCountByFilters([EMessageStatus.Danger], assignmentExecutorsFilters), [assignmentExecutorsFilters, logic])
  const warnCounter = useMemo(() => logic.getCountByFilters([EMessageStatus.Warn], assignmentExecutorsFilters), [assignmentExecutorsFilters, logic])
  const successCounter = useMemo(() => logic.getCountByFilters([EMessageStatus.Success], assignmentExecutorsFilters), [assignmentExecutorsFilters, logic])

  const toggleFilter = useCallback((status: EMessageStatus) => {
    const wasEnabled = activeFilters.includes(status)
    const newStatuses = wasEnabled ? activeFilters.filter((s) => s !== status) : [...new Set([...activeFilters, status])]

    onSetFilters(newStatuses)
  }, [onSetFilters, activeFilters])
  return (
    <>
      <SearchUserModal
        isOpened={isUsersSearchModalOpened}
        onClose={handleCloseSearchModal}
        onSelectItem={handleAddtUser}
        selectItemButtonText='Add'
        assignmentCountersMap={countersMap}
      />
      <Accordion allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                <Flex alignItems="center">
                  <Text fontWeight="400" fontSize="md" letterSpacing="0">
                    Assignment filters
                  </Text>
                  {hasEnabledFilters && <Box ml={2} h={2} w={2} borderRadius="100px" bg='blue.300'></Box>}
                </Flex>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} pt={4} pl={0} pr={0}>
            <Stack>
              <Flex alignItems="center">
                <Button variant='outline' onClick={toggleSearchModal} leftIcon={<CgSearch size={18}/>}>Search</Button>
                {hasEnabledFilters && <Button variant='outline' ml={2} onClick={onResetFilters} leftIcon={<IoMdClose size={17} />}>Clear ({assignmentExecutorsFilters.length})</Button>}
              </Flex>
              {/*
              <Grid templateColumns='1fr 1fr 1fr 50px' gap={2}>
                <Flex alignItems="center" justifyContent='center'><Box mr={2} h={2} w={2} borderRadius="100px" bg='red.300'></Box><Text>{dangerCounter}</Text></Flex>
                <Flex alignItems="center" justifyContent='center'><Box mr={2} h={2} w={2} borderRadius="100px" bg='yellow.300'></Box><Text>{warnCounter}</Text></Flex>
                <Flex alignItems="center" justifyContent='center'><Box mr={2} h={2} w={2} borderRadius="100px" bg='green.300'></Box><Text>{successCounter}</Text></Flex>
              </Grid>
              */}
              <Grid templateColumns='1fr 1fr 1fr 50px' gap={2}>
                <Button
                  onClick={() => { toggleFilter(EMessageStatus.Danger) }}
                  colorScheme={activeFilters.includes(EMessageStatus.Danger) ? 'red' : 'gray'}
                  isDisabled={!dangerCounter}
                  leftIcon={<AiOutlineFire size={14} />}
                >{dangerCounter}</Button>
                <Button
                  onClick={() => { toggleFilter(EMessageStatus.Warn) }}
                  colorScheme={activeFilters.includes(EMessageStatus.Warn) ? 'yellow' : 'gray'}
                  isDisabled={!warnCounter}
                  leftIcon={<FiActivity size={14} />}
                >{warnCounter}</Button>
                <Button
                  onClick={() => { toggleFilter(EMessageStatus.Success) }}
                  colorScheme={activeFilters.includes(EMessageStatus.Success) ? 'green' : 'gray'}
                  isDisabled={!successCounter}
                  leftIcon={<FaCheck size={11} />}
                >{successCounter}</Button>
                <Button
                  onClick={() => { onSetFilters([]) }}
                  colorScheme='gray'
                  isDisabled={activeFilters.length === 0}
                ><IoMdClose size={17} /></Button>
              </Grid>
              {users.map((name: string) => {
                const isBlue = assignmentExecutorsFilters.includes(name)
                return (
                  <Grid templateColumns='auto 50px' gap={2} key={name}>
                    <Button
                      onClick={() => handleUserFilterClick(name)}
                      colorScheme={isBlue ? 'blue' : 'gray'}
                      isDisabled={!countersMap[name].total}
                    >{getTruncated(name)}{!!countersMap[name].total ? ` (${countersMap[name].total})` : ''}</Button>
                    <Button
                      onClick={() => handleRemoveUser(name)}
                      colorScheme='gray'
                    ><FaTrashAlt size={14} /></Button>
                  </Grid>
                )
              })}
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  )
}
