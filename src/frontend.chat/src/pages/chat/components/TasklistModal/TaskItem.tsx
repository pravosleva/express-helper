import React, { useRef, useState, useMemo, useCallback } from "react"
import {
  Td, Tr, Editable, EditablePreview, EditableInput,
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
  Tooltip,
  Tag,
  Stack,
} from "@chakra-ui/react"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { GoGear } from 'react-icons/go'
// import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { MdModeEdit } from 'react-icons/md'
import { TiArrowLoop } from 'react-icons/ti'
// <TiArrowLoop size={19} />
// import { useDiffTime } from '~/common/hooks/useDiffTime'
// import { AiOutlineFire } from 'react-icons/ai'
import { MdTimer, MdTimerOff, MdAttachMoney, MdMoneyOff } from 'react-icons/md'
// import { GiDynamite } from 'react-icons/gi'
import { FaTrashAlt } from 'react-icons/fa'
import { PriceModal } from './components'
import { TTask } from './types'
import { getPrettyPrice } from '~/utils/getPrettyPrice'
import Countdown, { zeroPad } from 'react-countdown'
// import { BsFillCalendarFill } from 'react-icons/bs'

type TProps = {
  data: TTask
  onCompleteToggle: () => void
  onDelete: (ts: number) => void
  onEdit: (newData: any) => void
  onLoopSwitch: () => void
  onOpenDatePicker: (oldData: any) => void
  onPriceModalOpen: (data: any) => void
  onResetExpenses: () => void
}

const constants = {
  week: 7 * 24 * 60 * 60 * 1000,
  month1: 30 * 24 * 60 * 60 * 1000,
  month2: 2 * 30 * 24 * 60 * 60 * 1000,
  month6: 6 * 30 * 24 * 60 * 60 * 1000,
  day1: 1 * 24 * 60 * 60 * 1000,
  day2: 2 * 24 * 60 * 60 * 1000,
  sec20: 20 * 1000,
  year1: 1 * 12 * 30 * 24 * 60 * 60 * 1000,
  year3: 3 * 12 * 30 * 24 * 60 * 60 * 1000,
}

export const TaskItem = ({ data, onCompleteToggle, onDelete, onEdit, onLoopSwitch, onOpenDatePicker, onPriceModalOpen, onResetExpenses }: TProps) => {
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
      <Tag colorScheme='green'>Ready</Tag>
    )
  
    return (
      <Tag>{!!days ? `${days} d ` : ''}{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</Tag>
    )
  }
  const timeEnd: any = !!checkTs && !!uncheckTs && isCompleted && isLooped ? checkTs + (checkTs - uncheckTs) : null
  const timeSection = (
    <>
      {!!timeEnd ? (
        <Text>
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

  const MemoizedMenu = useMemo(() => {
    // NOTE: !(all fields is ok)
    const isFirstLoopRunning = !(!!data.checkTs && !!data.uncheckTs)

    return (
      <>
        <Menu
          // strategy='fixed'
          placement='left-end'
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
                {!!fixedDiff && (
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
                    
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: 1 * 60 * 60 * 1000 })}
                      isDisabled={fixedDiff === 1 * 60 * 60 * 1000}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 1 h</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.week })}
                      isDisabled={fixedDiff === constants.week}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 1 week</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.month2 })}
                      isDisabled={fixedDiff === constants.month2}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 2 month</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.month1 })}
                      isDisabled={fixedDiff === constants.month1}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 1 month</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.month6 })}
                      isDisabled={fixedDiff === constants.month6}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 6 months</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.day1 })}
                      isDisabled={fixedDiff === constants.day1}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 1 day</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.day2 })}
                      isDisabled={fixedDiff === constants.day2}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 2 days</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.sec20 })}
                      isDisabled={fixedDiff === constants.sec20}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 20 s</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.year1 })}
                      isDisabled={fixedDiff === constants.year1}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 1 year</Text>
                      </Flex>
                    </MenuItem>
                    <MenuItem
                      minH="40px"
                      onClick={() => onEdit({ ...data, newFixedDiffTs: constants.year3 })}
                      isDisabled={fixedDiff === constants.year3}
                    >
                      <Flex display="flex" alignItems="center">
                        <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                        <Text fontSize="md" fontWeight='bold'>Set 3 years</Text>
                      </Flex>
                    </MenuItem>
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
    <>
      <Tr>
        <Td>
          <Flex display="flex" alignItems="center">
            <Text color='green.500' fontSize="md" onClick={onCompleteToggle}>{isCompleted ? <ImCheckboxChecked size={18} /> : <ImCheckboxUnchecked size={18} />}</Text>
            {/*
            {percentageInProgress && (
              <Tooltip label="Работает таймер" aria-label="A tooltip1" placement="top-start">
                <Text color="gray.300"><GiDynamite size={18} /></Text>
              </Tooltip>
            )}
            {showTimer && (
              <Tooltip label="Отслеживается первый цикл" aria-label="A tooltip2" placement="top-start">
                <Text color="gray.300"><MdTimer size={18} /></Text>
              </Tooltip>
            )}
            {showTimerOff && (
              <Tooltip label="Используется интервал" aria-label="A tooltip3" placement="top-start">
                <Text color="gray.300"><MdTimerOff size={18} /></Text>
              </Tooltip>
            )}
            */}
          </Flex>
        </Td>
        <Td /* fontWeight='bold' */ pl={0} pr={0}>
          <Stack>
            <Editable
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
          </Stack>
        </Td>
        <Td isNumeric>
          {/* <IconButton
            aria-label="DEL"
            isRound
            icon={<FaRegTrashAlt size={15} />}
            onClick={() => onDelete(data.ts)}
          >
            DEL
          </IconButton> */}
          {/* <Button onClick={handleEditOpen}>EDIT</Button> */}
          {MemoizedMenu}
        </Td>
      </Tr>
    </>
  )
}
