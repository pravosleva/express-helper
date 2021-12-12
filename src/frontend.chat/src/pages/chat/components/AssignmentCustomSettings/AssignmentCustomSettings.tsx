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
} from '@chakra-ui/react'
import { useDebounce, useLocalStorage } from 'react-use'
import { SearchUserModal } from '~/pages/chat/components/SearchUserModal'
import { CgSearch, CgAssign } from 'react-icons/cg'
import { getTruncated } from '~/utils/strings-ops'
import { IoMdClose } from 'react-icons/io'

type TSetting = {
  name: string
  ts: number
}
type TProps = {
  onAddAssignedToFilters: (name: string) => void
  onRemoveAssignedToFilters: (name: string) => void
  logic: any
  assignmentExecutorsFilters: string[]
  onResetFilters?: () => void
}

export const AssignmentCustomSettings = ({
  logic,
  onAddAssignedToFilters,
  onRemoveAssignedToFilters,
  assignmentExecutorsFilters,
  onResetFilters,
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
    const res: {[key: string]: number} = {}

    // logic
    for (const key in settingsLS) {
      res[key] = logic.getAssignmentCounterExecutor(key)
    }

    return res
  }, [logic, settingsLS])
  const hasEnabledFilters = assignmentExecutorsFilters.length > 0

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
                {hasEnabledFilters && <Button variant='outline' ml={2} onClick={onResetFilters} leftIcon={<IoMdClose size={17} />}>Clear</Button>}
              </Flex>
              {users.map((name: string) => {
                const isBlue = assignmentExecutorsFilters.includes(name)
                return (
                  <Button
                    key={name}
                    onClick={() => handleUserFilterClick(name)}
                    colorScheme={isBlue ? 'blue' : 'gray'}
                    isDisabled={!countersMap[name]}
                  >{getTruncated(name)}{!!countersMap[name] ? ` (${countersMap[name]})` : ''}</Button>
                )
              })}
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  )
}
