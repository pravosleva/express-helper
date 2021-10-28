import {
  Td, Tr, Editable, EditablePreview, EditableInput,
  IconButton,
  // useEditableControls, ButtonGroup, Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  MenuDivider,
  MenuOptionGroup,
  FormControl,
  FormLabel,
  Switch,
  Flex,
} from "@chakra-ui/react"
import { useRef } from "react"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { GoGear } from 'react-icons/go'
// import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { MdModeEdit } from 'react-icons/md'
import { TiArrowLoop } from 'react-icons/ti'

import { useDiffTime } from '~/common/hooks/useDiffTime'
import { AiOutlineFire } from 'react-icons/ai'
import { MdTimer, MdTimerOff } from 'react-icons/md'
import { GiDynamite } from 'react-icons/gi'

type TTask = {
  title: string
  description?: string
  ts: number
  isCompleted: boolean

  // NOTE: New feature - auto uncheck looper
  isLooped?: boolean
  checkTsList?: number[]
  uncheckTsList?: number[]
  fixedDiff?: number
}
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
  } = data
  const titleEditedRef = useRef<string>(data.title)
  
  const targetDateTs = !!checkTsList ? checkTsList[checkTsList.length - 1] : 0
  const startDateTs = !!uncheckTsList ? uncheckTsList[uncheckTsList.length - 1] : 0
  // const targetDateTs = !!uncheckTsList ? uncheckTsList[uncheckTsList.length - 1] : ts
  // const startDateTs = !!checkTsList && checkTsList.length > 2 ? checkTsList[checkTsList.length - 2] : 0
  const [percentage, diff] = useDiffTime({ targetDateTs, startDateTs })

  const percentageInProgress = isLooped && isCompleted && !!checkTsList && !!uncheckTsList && (percentage > 0 && percentage <= 100)
  const showFire = isLooped && isCompleted && !!checkTsList && !!uncheckTsList && percentage > 100
  const showTimer = isLooped && (!checkTsList || (Array.isArray(checkTsList) && checkTsList.length === 0))
  const showTimerOff = isLooped && (!!checkTsList && Array.isArray(checkTsList) && checkTsList.length > 0) && !showFire && !percentageInProgress

  return (
    <Tr>
      <Td
        onClick={onCompleteToggle}
      >
        <Flex display="flex" alignItems="center">
          <Text color='green.500' fontSize="md" mr={2}>{isCompleted ? <ImCheckboxChecked size={18} /> : <ImCheckboxUnchecked size={18} />}</Text>
          {showFire && <Text color="red.300"><AiOutlineFire size={18} /></Text>}
          {percentageInProgress && <Text color={diff.inDays < 2 ? "green.300" : "gray.300"}><GiDynamite size={18} /></Text>}
          {showTimer && <Text color="gray.300"><MdTimer size={18} /></Text>}
          {showTimerOff && <Text color="gray.300"><MdTimerOff size={18} /></Text>}
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
          {/* percentageInProgress ? <Text fontSize="sm">{percentage.toFixed(0)} %</Text> : null */}
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
            isRound="true"
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
            <MenuItem
              // _hover={{ bg: "gray.400", color: 'white' }}
              // _focus={{ bg: "gray.400", color: 'white' }}
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
            <MenuDivider />
            <MenuOptionGroup defaultValue="asc" title='Controls'>
              {!!fixedDiff && (
                <MenuItem
                  // _first={{ bg: "gray.200" }}
                  // _hover={{ bg: "gray.400", color: 'white' }}
                  // _focus={{ bg: "gray.400", color: 'white' }}
                  minH="40px"
                  onClick={() => onEdit({ ...data, resetLooper: true})}
                  // isDisabled={}
                  // bgColor='green.300'
                  // color='#fff'
                >
                  <Text fontSize="md" fontWeight='bold'>Reset Looper</Text>
                </MenuItem>
              )}
              <MenuItem
                // _first={{ bg: "gray.200" }}
                // _hover={{ bg: "gray.400", color: 'white' }}
                // _focus={{ bg: "gray.400", color: 'white' }}
                minH="40px"
                onClick={() => onDelete(data.ts)}
                // isDisabled={}
                bgColor='red.300'
                color='#fff'
              >
                <Text fontSize="md" fontWeight='bold'>DELETE</Text>
              </MenuItem>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  )
}
