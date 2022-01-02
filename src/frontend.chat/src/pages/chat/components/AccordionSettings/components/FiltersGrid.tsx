import { useState, useCallback, useMemo, useEffect } from 'react'
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
  Spinner,
  FormControl,
  Switch,
  FormLabel,
} from '@chakra-ui/react'
import { useDebounce, useLocalStorage } from 'react-use'
import { CgSearch, CgAssign } from 'react-icons/cg'
import { IoMdClose } from 'react-icons/io'
import { FaTrashAlt, FaCheck } from 'react-icons/fa'
import { AiOutlineFire } from 'react-icons/ai'
import { FiActivity } from 'react-icons/fi'
import { EMessageStatus, TMessage, ERegistryLevel } from '~/utils/interfaces'
import { TNotifItem } from '../../NotifsList'
// import { useMainContext } from '~/context/mainContext'

type TProps = {
  toggleFilter: (status: EMessageStatus) => void
  // activeFilters: EMessageStatus[]
  onSetFilters: (ss: EMessageStatus[]) => void
  allNotifs: TNotifItem[]
  activeFilters: EMessageStatus[]
}

export const FiltersGrid = ({
  toggleFilter,
  onSetFilters,
  allNotifs,
  activeFilters,
}: TProps) => {
  const dangerCounter = allNotifs.reduce((acc, { original }) => !!original?.status && original.status === EMessageStatus.Danger ? acc += 1 : acc, 0)
  const warnCounter = allNotifs.reduce((acc, { original }) => !!original?.status && original.status === EMessageStatus.Warn ? acc += 1 : acc, 0)
  const successCounter = allNotifs.reduce((acc, { original }) => !!original?.status && original.status === EMessageStatus.Success ? acc += 1 : acc, 0)

  return (
    <Grid templateColumns='1fr 1fr 1fr 50px' gap={2} mb={4}>
      <Button
        size='sm'
        onClick={() => { toggleFilter(EMessageStatus.Danger) }}
        colorScheme={activeFilters.includes(EMessageStatus.Danger) ? 'red' : 'gray'}
        isDisabled={!dangerCounter}
        leftIcon={<AiOutlineFire size={14} />}
      >{dangerCounter}</Button>
      <Button
        size='sm'
        onClick={() => { toggleFilter(EMessageStatus.Warn) }}
        colorScheme={activeFilters.includes(EMessageStatus.Warn) ? 'yellow' : 'gray'}
        isDisabled={!warnCounter}
        leftIcon={<FiActivity size={14} />}
      >{warnCounter}</Button>
      <Button
        size='sm'
        onClick={() => { toggleFilter(EMessageStatus.Success) }}
        colorScheme={activeFilters.includes(EMessageStatus.Success) ? 'green' : 'gray'}
        isDisabled={!successCounter}
        leftIcon={<FaCheck size={11} />}
      >{successCounter}</Button>
      <Button
        size='sm'
        onClick={() => { onSetFilters([]) }}
        colorScheme='gray'
        isDisabled={activeFilters.length === 0}
        variant='outline'
      ><IoMdClose size={17} /></Button>
    </Grid>
  )
}
