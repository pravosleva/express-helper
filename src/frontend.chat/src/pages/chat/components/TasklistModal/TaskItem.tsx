import React, { useRef, useMemo, memo } from "react"
import {
  Editable, EditablePreview, EditableInput,
  IconButton,
  // useEditableControls, ButtonGroup, Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  MenuDivider,
  MenuOptionGroup,
  Flex,
  // Tooltip,
  Box,
  Tag,
  // Stack,
  useColorMode,
} from "@chakra-ui/react"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { GoGear } from 'react-icons/go'
// import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { MdModeEdit } from 'react-icons/md'
import { TiArrowLoop } from 'react-icons/ti'
// <TiArrowLoop size={19} />
// import { useDiffTime } from '~/common/hooks/useDiffTime'
// import { AiOutlineFire } from 'react-icons/ai'
import {
  // MdTimer, MdTimerOff,
  MdAttachMoney, MdMoneyOff,
} from 'react-icons/md'
// import { GiDynamite } from 'react-icons/gi'
import { FaTrashAlt } from 'react-icons/fa'
// import { PriceModal } from './components'
import { TTask } from './types'
import { getPrettyPrice } from '~/utils/getPrettyPrice'
import Countdown, { zeroPad } from 'react-countdown'
// import { BsFillCalendarFill } from 'react-icons/bs'
import styles from './TaskItem.module.scss'

type TProps = {
  char: string
  data: TTask
  onCompleteToggle: () => void
  onDelete: (ts: number) => void
  onEdit: (newData: any) => void
  onLoopSwitch: () => void
  onOpenDatePicker: (oldData: any) => void
  onPriceModalOpen: (data: any) => void
  onResetExpenses: () => void
}

const constants: {
  [key: string]: {
    value: number;
    label: string;
  }
} = {
  h1: {
    value: 1 * 60 * 60 * 1000,
    label: '1 hour',
  },
  week: {
    value: 7 * 24 * 60 * 60 * 1000,
    label: '1 week',
  },
  month1: {
    value: 1 * 30 * 24 * 60 * 60 * 1000,
    label: '1 month',
  },
  month2: {
    value: 2 * 30 * 24 * 60 * 60 * 1000,
    label: '2 months',
  },
  month3: {
    value: 3 * 30 * 24 * 60 * 60 * 1000,
    label: '3 months',
  },
  month6: {
    value: 6 * 30 * 24 * 60 * 60 * 1000,
    label: '6 months',
  },
  day1: {
    value: 1 * 24 * 60 * 60 * 1000,
    label: '1 day',
  },
  day2: {
    value: 2 * 24 * 60 * 60 * 1000,
    label: '2 days',
  },
  day10: {
    value: 10 * 24 * 60 * 60 * 1000,
    label: '10 days',
  },
  year1: {
    value: 1 * 12 * 30 * 24 * 60 * 60 * 1000,
    label: '1 year',
  },
  year2: {
    value: 2 * 12 * 30 * 24 * 60 * 60 * 1000,
    label: '2 years',
  },
  year3: {
    value: 3 * 12 * 30 * 24 * 60 * 60 * 1000,
    label: '3 years',
  },
  year10: {
    value: 10 * 12 * 30 * 24 * 60 * 60 * 1000,
    label: '10 years',
  },
}

const getColorByDays = (days: number) => days <= 14
    ? days <= 3
    ? 'red'
    : 'yellow'
    : 'gray'

export const TaskItem = memo(({ data, onCompleteToggle, onDelete, onEdit, onLoopSwitch, onOpenDatePicker, onPriceModalOpen, onResetExpenses, char }: TProps) => {
  const {
    title,
    // description,
    isCompleted,
    isLooped,
    checkTs,
    uncheckTs,
    // ts,
    fixedDiff,
    price,
  } = data
  const titleEditedRef = useRef<string>(data.title)

  const CountdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {

    const showFire = isLooped && isCompleted && completed

    // if (showFire) return (
    //   <Tooltip label="Таймер сработал" aria-label="A tooltip0" placement="top-start">
    //     <Text ><AiOutlineFire size={18} /> Ready</Text>
    //   </Tooltip>
    // )
    if (showFire) return (
      <Tag colorScheme='green' rounded='2xl' style={{ fontFamily: 'system-ui' }}>Ready</Tag>
    )
  
    return (
      <Tag rounded='2xl' colorScheme={getColorByDays(days)} style={{ fontFamily: 'system-ui' }}>{!!days ? `${days} d ` : ''}{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</Tag>
    )
  }
  const timeEnd: any = !!checkTs && !!uncheckTs && isCompleted && isLooped ? checkTs + (checkTs - uncheckTs) : null
  const timeSection = (
    <>
      {!!timeEnd ? (
        <Text mt={2}>
          <Countdown
            date={timeEnd}
            renderer={CountdownRenderer}
          />
        </Text>
      ) : null}
      {!!price && <Text fontSize="sm" /* fontWeight='bold' */>={getPrettyPrice(price)}</Text>}
    </>
  ) // !!diff ? <TimeTag diff={diff} isCompleted={isCompleted} /> : null

  // const handleOpenDatepicker = () => {
  //   onOpenDatePicker(data)
  // }

  const mode = useColorMode()

  const MemoizedMenu = useMemo(() => {
    // NOTE: !(all fields is ok)
    const isFirstLoopRunning = !(!!data.checkTs && !!data.uncheckTs)
    
    return (
      <>
        <Menu
          // strategy='fixed'
          placement='right-end'
        >
          <MenuButton
            as={IconButton}
            colorScheme={isLooped ? isFirstLoopRunning ? "yellow" : "blue" : "gray"}
            icon={isLooped ? <TiArrowLoop size={19} /> : <GoGear size={18} />}
            isRound
            // mr={2}
            _expanded={{ color: isLooped ? isFirstLoopRunning ? "yellow.200" : "blue.200" : "gray.200", bg: "gray.500" }}
          >
            Main
          </MenuButton>
          <MenuList
            zIndex={1001}
            _dark={{ bg: "gray.600" }}
            // _hover={{ bg: "gray.500", color: 'white' }}
            // _expanded={{ bg: "gray.800" }}
            // _focus={{ boxShadow: "outline" }}
          >
            <MenuOptionGroup defaultValue="asc" title='Looper'>
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
              >
                <MenuItem
                  _hover={{ bg: "gray.500", color: 'white' }}
                  _focus={{ bg: "gray.500", color: 'white' }}
                  minH="40px"
                  key="tasklist-btn.task-item.is-looped"
                  onClick={onLoopSwitch}
                  closeOnSelect={false}
                >
                  <Flex display="flex" alignItems="center">
                    <Text fontSize="md" fontWeight='bold' mr={4}>{isLooped ? <ImCheckboxChecked size={18} /> : <ImCheckboxUnchecked size={18} />}</Text>
                    <Text fontSize="md" fontWeight='bold'>Is looped?</Text>
                  </Flex>
                </MenuItem>
                {!!fixedDiff && isLooped && (
                  <>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, resetLooper: true})}
                      // isDisabled={}
                      // bgColor='green.300'
                      // color='#fff'
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Reset Looper</Text>
                      </Flex>
                    </MenuItem>
                    {/*
                    <MenuItem
                      minH="40px"
                      onClick={handleOpenDatepicker}
                      // isDisabled={}
                      // bgColor='green.300'
                      // color='#fff'
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><BsFillCalendarFill size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set First Date</Text>
                      </Flex>
                    </MenuItem> */}

                    {Object.keys(constants).map((key) => (
                      <MenuItem
                        key={key}
                        minH="40px"
                        onClick={() => onEdit({ ...data, newFixedDiffTs: constants[key].value })}
                        isDisabled={fixedDiff === constants[key].value}
                      >
                        <Flex display="flex" alignItems="center">
                          <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                          <Text fontSize="md" fontWeight='bold'>{constants[key].label}</Text>
                        </Flex>
                      </MenuItem>
                    ))}
                  </>
                )}
              </div>
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup defaultValue="asc" title='Controls'>
              <MenuItem
                minH="40px"
                onClick={() => onPriceModalOpen(data)}
              >
                <Flex display="flex" alignItems="center">
                  <Text fontSize="md" fontWeight='bold' mr={4}><MdAttachMoney size={18} /></Text>
                  <Text fontSize="md" fontWeight='bold'>Set Expenses</Text>
                </Flex>
              </MenuItem>
              {
                !!price && (
                  <MenuItem
                    minH="40px"
                    onClick={onResetExpenses}
                  >
                    <Flex display="flex" alignItems="center">
                      <Text fontSize="md" fontWeight='bold' mr={4}><MdMoneyOff size={18} /></Text>
                      <Text fontSize="md" fontWeight='bold'>Reset Expenses</Text>
                    </Flex>
                  </MenuItem>
                )
              }
              <MenuItem
                minH="40px"
                onClick={() => onDelete(data.ts)}
                bgColor='red.300'
                color='#fff'
                // _first={{ bg: "red.400" }}
                _hover={{ bg: "red.400", color: 'white' }}
                _focus={{ bg: "red.400", color: 'white' }}
              >
                <Flex display="flex" alignItems="center">
                  <Text fontSize="md" fontWeight='bold' mr={4}><FaTrashAlt size={18} /></Text>
                  <Text fontSize="md" fontWeight='bold'>Delete</Text>
                </Flex>
              </MenuItem>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </>
    )
  }, [isLooped, onDelete, JSON.stringify(data), onResetExpenses, onPriceModalOpen, onEdit, onLoopSwitch, isLooped, fixedDiff])
  
  return (
    <div
      className={styles[`themed-task-item_${mode.colorMode}`]}
      style={{
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Box p={5} pl={6} as='div'>
        {MemoizedMenu}
      </Box>
      <Box p={5} pl={0} pr={0} fontSize='15px' as='div'>
        <div>
          <Editable
            border='2px dashed rgba(211,211,211,0.3)'
            style={{ width: 'auto' }}
            pl={2}
            pr={2}
            fontWeight='bold' 
            defaultValue={title}
            onChange={(nextVal: string) => {
              titleEditedRef.current = nextVal
            }}
            onSubmit={() => {
              onEdit({ ...data, title: titleEditedRef.current })
            }}
          >
            <EditablePreview />
            <EditableInput />
          </Editable>

          {timeSection}
        </div>
      </Box>
      <Box p={5} style={{ marginLeft: 'auto' }} as='div'>
        <Flex display="flex" alignItems="center">
          <Text pt={2} color='green.500' fontSize="md" onClick={onCompleteToggle}>
            {isCompleted ? <ImCheckboxChecked size={20} /> : <ImCheckboxUnchecked size={20} />}
          </Text>
        </Flex>
      </Box>
    </div>
  )
})
