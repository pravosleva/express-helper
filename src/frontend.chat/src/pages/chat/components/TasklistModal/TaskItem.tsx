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
} from "@chakra-ui/react"
import { useRef, useState, useMemo } from "react"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { GoGear } from 'react-icons/go'
// import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { MdModeEdit } from 'react-icons/md'
import { TiArrowLoop } from 'react-icons/ti'

import { useDiffTime } from '~/common/hooks/useDiffTime'
import { AiOutlineFire } from 'react-icons/ai'
import { MdTimer, MdTimerOff, MdAttachMoney, MdMoneyOff } from 'react-icons/md'
import { GiDynamite } from 'react-icons/gi'
import { FaTrashAlt } from 'react-icons/fa'
import { PriceModal } from './components'
import { TTask } from './types'
import { getPrettyPrice } from '~/utils/getPrettyPrice'

type TProps = {
  data: TTask
  onCompleteToggle: () => void
  onDelete: (ts: number) => void
  onEdit: (newData: any) => void
  onLoopSwitch: () => void
}

export const TaskItem = ({ data, onCompleteToggle, onDelete, onEdit, onLoopSwitch }: TProps) => {
  const {
    title,
    // description,
    isCompleted,
    isLooped,
    checkTsList,
    uncheckTsList,
    ts,
    fixedDiff,
    price,
  } = data
  const titleEditedRef = useRef<string>(data.title)
  
  const targetDateTs = !!checkTsList ? checkTsList[0] : 0
  const startDateTs = !!uncheckTsList ? uncheckTsList[0] : 0
  // const targetDateTs = !!uncheckTsList ? uncheckTsList[uncheckTsList.length - 1] : ts
  // const startDateTs = !!checkTsList && checkTsList.length > 2 ? checkTsList[checkTsList.length - 2] : 0
  const [percentage, diff] = useDiffTime({ targetDateTs, startDateTs })

  const percentageInProgress = isLooped && isCompleted && !!checkTsList && !!uncheckTsList && (percentage >= 0 && percentage < 100)
  const showFire = isLooped && isCompleted && !!checkTsList && !!uncheckTsList && percentage > 100
  const showTimer = isLooped && (!checkTsList || (Array.isArray(checkTsList) && checkTsList.length === 0))
  const showTimerOff = isLooped && (!!checkTsList && Array.isArray(checkTsList) && checkTsList.length > 0) && !showFire && !percentageInProgress

  // --
  const [isPriceModalOpened, setIsPriceModalOpened] = useState<boolean>(false)
  const handleOpenPriceModal = () => {
    setIsPriceModalOpened(true)
  }
  const handleClosePriceModal = () => {
    setIsPriceModalOpened(false)
  }
  const handlePriceModalSubmit = (price: number) => {
    if (Number.isInteger(price)) onEdit({ ...data, price: price })
  }
  const handleResetExpenses = () => {
    onEdit({ ...data, price: 0 })
  }
  // --

  const timeTag = useMemo(() => isCompleted && (
    diff.inMonths > 1
      ? <Tag>{diff.inMonths.toFixed(0)} months left</Tag>
      : diff.inDays > 1
        ? <Tag>{diff.inDays.toFixed(0)} days left</Tag>
        : diff.inHours > 1
          ? <Tag>{diff.inHours.toFixed(0)} hours left</Tag>
          : diff.inMinutes > 1
            ? <Tag>{diff.inMinutes.toFixed(0)} min left</Tag>
            : diff.inSeconds > 1
            ? <Tag>{diff.inSeconds.toFixed(0)} s left</Tag>
            : null // <Tag>{diff.inSeconds} / {percentage.toFixed(0)} / {!!checkTsList ? checkTsList[0] : 'no checklist'}</Tag>
    ), [diff])

  return (
    <>
      <PriceModal
        isOpened={isPriceModalOpened}
        onClose={handleClosePriceModal}
        onSubmit={handlePriceModalSubmit}
        initialPrice={price || 0}
      />
      <Tr>
        <Td>
          <Flex display="flex" alignItems="center">
            <Text color={showTimer ? 'gray.300' : 'green.500'} fontSize="md" mr={2} onClick={onCompleteToggle}>{isCompleted ? <ImCheckboxChecked size={18} /> : <ImCheckboxUnchecked size={18} />}</Text>
            {showFire && (
              <Tooltip label="Таймер сработал" aria-label="A tooltip0" placement="top-start">
                <Text color="red.300"><AiOutlineFire size={18} /></Text>
              </Tooltip>
            )}
            {percentageInProgress && (
              <Tooltip label="Работает таймер" aria-label="A tooltip1" placement="top-start">
                <Text color={diff.inDays < 2 ? "green.500" : "gray.300"}><GiDynamite size={18} /></Text>
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
          </Flex>
        </Td>
        <Td fontWeight='bold'>
          <div>
            <Editable
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
            
            {/* percentageInProgress && <Text fontSize="sm">{percentage.toFixed(0)} %</Text> */}
            {/* <Button
              size='sm'
              onClick={() => {
                console.log('SET PRICE')
              }}
            >
              Set Price
            </Button> */}
            {!!price ? (
              <Text fontSize="lg" fontWeight='bold'>{timeTag} ={getPrettyPrice(price)}</Text>
            ) : (
              percentageInProgress ? <Text fontSize="lg" fontWeight='bold'>{timeTag}</Text> : null
            )}
          </div>
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
          <Menu>
            <MenuButton
              as={IconButton}
              colorScheme={isLooped ? "blue" : "gray"}
              icon={isLooped ? <TiArrowLoop size={19} /> : <GoGear size={18} />}
              isRound
              mr={2}
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
                    <div
                      style={{
                        maxHeight: '120px',
                        overflowY: 'auto',
                      }}
                    >
                      {/* <MenuItem
                        minH="40px"
                        onClick={() => onEdit({ ...data, newFixedDiffTs: 10 * 1000 })}
                        isDisabled={fixedDiff === 10 * 1000}
                        // bgColor='green.300'
                        // color='#fff'
                      >
                        <Flex display="flex" alignItems="center">
                          <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                          <Text fontSize="md" fontWeight='bold'>Set 10 s</Text>
                        </Flex>
                      </MenuItem> */}
                      <MenuItem
                        minH="40px"
                        onClick={() => onEdit({ ...data, newFixedDiffTs: 1 * 60 * 60 * 1000 })}
                        isDisabled={fixedDiff === 1 * 60 * 60 * 1000}
                        // bgColor='green.300'
                        // color='#fff'
                      >
                        <Flex display="flex" alignItems="center">
                          <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                          <Text fontSize="md" fontWeight='bold'>Set 1 h</Text>
                        </Flex>
                      </MenuItem>
                      <MenuItem
                        minH="40px"
                        onClick={() => onEdit({ ...data, newFixedDiffTs: 7 * 24 * 60 * 60 * 1000 })}
                        isDisabled={fixedDiff === 7 * 24 * 60 * 60 * 1000}
                        // bgColor='green.300'
                        // color='#fff'
                      >
                        <Flex display="flex" alignItems="center">
                          <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                          <Text fontSize="md" fontWeight='bold'>Set 1 week</Text>
                        </Flex>
                      </MenuItem>
                      <MenuItem
                        minH="40px"
                        onClick={() => onEdit({ ...data, newFixedDiffTs: 30 * 24 * 60 * 60 * 1000 })}
                        isDisabled={fixedDiff === 30 * 24 * 60 * 60 * 1000}
                        // bgColor='green.300'
                        // color='#fff'
                      >
                        <Flex display="flex" alignItems="center">
                          <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                          <Text fontSize="md" fontWeight='bold'>Set 1 month</Text>
                        </Flex>
                      </MenuItem>
                      <MenuItem
                        minH="40px"
                        onClick={() => onEdit({ ...data, newFixedDiffTs: 6 * 30 * 24 * 60 * 60 * 1000 })}
                        isDisabled={fixedDiff === 6 * 30 * 24 * 60 * 60 * 1000}
                        // bgColor='green.300'
                        // color='#fff'
                      >
                        <Flex display="flex" alignItems="center">
                          <Text fontSize="md" fontWeight='bold' mr={4}><TiArrowLoop size={18} /></Text>
                          <Text fontSize="md" fontWeight='bold'>Set 6 months</Text>
                        </Flex>
                      </MenuItem>
                    </div>
                  </>
                )}
              </MenuOptionGroup>
              <MenuDivider />
              <MenuOptionGroup defaultValue="asc" title='Controls'>
                <MenuItem
                  minH="40px"
                  onClick={handleOpenPriceModal}
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
                      onClick={handleResetExpenses}
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
        </Td>
      </Tr>
    </>
  )
}
