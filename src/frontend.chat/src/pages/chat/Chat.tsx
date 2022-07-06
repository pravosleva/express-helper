import React, { Fragment, useContext, useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { MainContext } from '~/context/mainContext'
import { useSocketContext } from '~/context/socketContext'
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  Menu,
  Button,
  MenuButton,
  MenuList,
  MenuItem,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  // FormLabel,
  FormControl,
  ModalFooter,
  MenuOptionGroup,
  // MenuItemOption,
  MenuDivider,

  useDisclosure,
  // useBreakpointValue,
  useMediaQuery,
  Progress,
  Spinner,
  Drawer,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Stack,
  // Switch,
  // HStack,
  TagCloseButton,
  TagLabel,
  Tag,
  Grid,
  useToast, UseToastOptions, ButtonGroup, Tooltip, color,
  // color
} from '@chakra-ui/react'
import { FiActivity, FiFilter, FiMenu } from 'react-icons/fi'
import {
  // BiMessageDetail,
  BiUpArrowAlt,
} from 'react-icons/bi'
import {
  RiSendPlaneFill,
  // RiErrorWarningFill,
} from 'react-icons/ri'
import {
  FaCheckCircle,
  FaCheck,
  // FaListUl,
} from 'react-icons/fa'
import { GiDeathSkull } from 'react-icons/gi'
import { HiOutlineMenuAlt2 } from 'react-icons/hi'
// @ts-ignore
import ScrollToBottom from 'react-scroll-to-bottom'
import clsx from 'clsx'
import styles from './Chat.module.scss'
import stylesBase from '~/App.module.scss'
// import stylesCustomReactCtxMenu from '~/fix.react-contextmenu.scss'
import { UsersContext } from '~/context/usersContext'
import { useTextCounter } from '~/common/hooks/useTextCounter'
import { getNormalizedDateTime, getNormalizedDateTime2, getNormalizedDateTime3 } from '~/utils/timeConverter'
import { ContextMenu, MenuItem as CtxMenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { ColorModeSwitcher } from '~/common/components/ColorModeSwitcher'
import { SetPasswordModal } from './components/SetPasswordModal'
import { MyInfoModal } from './components/MyInfoModal'
import { TasklistModal } from './components/TasklistModal/TasklistModal'
import { sm, md, lg } from '~/common/chakra/theme'
import { IoMdLogOut } from 'react-icons/io'
import { CgSearch, CgAssign } from 'react-icons/cg'
import { binarySearchTsIndex } from '~/utils/sort/binarySearch'
import { useInView } from 'react-intersection-observer'
import { Logic } from './MessagesLogic'
import { useForm } from '~/common/hooks/useForm'
// import { SearchInModal } from './components/SearchInModal'
import { IoMdClose } from 'react-icons/io'
import { AiFillTags, AiTwotoneEdit } from 'react-icons/ai'
import { useLocalStorage } from 'react-use'
import { UploadInput } from './components/UploadInput'
// import 'react-medium-image-zoom/dist/styles.css'
import { EMessageStatus, TMessage, ERegistryLevel } from '~/utils/interfaces'
import { Image } from './components/chat-msg'
import { GalleryModal } from './components/GalleryModal'
import { getTruncated } from '~/utils/strings-ops'
import { Roomlist } from './components/MenuBar/components'
import { hasNewsInRoomlist } from '~/utils/hasNewsInRoomlist'
import { SearchUserModal } from './components/SearchUserModal'
import { UserAva } from '~/pages/chat/components/UserAva'
import { AssignedBox } from './components/AssignedBox'
import { AccordionSettings } from './components/AccordionSettings'
import { FcGallery } from 'react-icons/fc'
// import { EmojiPickerModal } from './components/EmojiPickerModal'
import axios from 'axios'
import { openExternalLink } from '~/utils/openExternalLink'
import { CopyToClipboard } from 'react-copy-to-clipboard'
// import { FaFire } from 'react-icons/fa'
import { ImFire } from 'react-icons/im'
import { FaTelegramPlane, FaRunning } from 'react-icons/fa'
import { DatepickerModal } from '~/pages/chat/components/TasklistModal/components/DatepickerModal' // './components/DatepickerModal'
import { useSnapshot } from 'valtio'
import { FiArrowRight } from 'react-icons/fi'
import { CheckRoomSprintPolling } from '~/common/components/CheckRoomSprintPolling'
import { BsFillCalendarFill } from 'react-icons/bs'
import { PollingComponent } from '~/common/components/PollingComponent'
import { SwitchSection } from '~/common/components/SwitchSection'
import { webWorkersInstance } from '~/utils'
import { AddLinkFormModal } from './components/AddLinkFormModal'
import { Widget } from './components/Widget'
// import { TasklistContent } from './components/TasklistModal/components'
// import debounce from 'lodash.debounce'
import { useColorMode } from '@chakra-ui/react'
// import { useLatest } from '~/common/hooks/useLatest'
import pkg from '../../../package.json'
import { SpecialTabs } from './components/SpecialTabs'
import { TagsInModal } from './components/TagsInModal'
import {
  // useDeepEffect,
  useCompare,
} from '~/common/hooks/useDeepEffect'
import { BiRefresh } from 'react-icons/bi'
import { GoChecklist } from 'react-icons/go'
import { useLatest } from '~/common/hooks/useLatest'
import { useDebounce as useDebouncedValue } from '~/common/hooks/useDebounce'
import { FixedSearch } from './components/FixedSearch'
import { FixedBottomSheet, MainSpace } from './components/FixedBottomSheet'
import { BsTable } from 'react-icons/bs'
// @ts-ignore
import Board from '@asseinfo/react-kanban'
import '@asseinfo/react-kanban/dist/styles.css'
// @ts-ignore
// import dims from '../../common/scss-vars/dims.scss'
import {
  // FaRegSmile,
  FaPlus,
} from 'react-icons/fa'
// import { BsFillPlusCircleFill } from 'react-icons/bs'
import { CountdownRenderer } from './components/NotifsList/components/CountdownRenderer'
import Countdown from 'react-countdown'
import { getNormalizedWordsArr } from '~/utils/strings-ops/getNormalizedWords'
import { scrollIntoView } from '~/utils/scrollTo'
import { CgArrowsVAlt } from 'react-icons/cg'
import useDynamicRefs from 'use-dynamic-refs'
// import { useLocalStorageState as useLocalStorageState2 } from '~/common/hooks/useStorage'

const roomDesktopWidth = 400 // parseInt(dims.roomDesktopWidth)

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || ''
const REACT_APP_PRAVOSLEVA_BOT_BASE_URL = process.env.REACT_APP_PRAVOSLEVA_BOT_BASE_URL || 'https://t.me/pravosleva_bot'
// const REACT_APP_CHAT_NAME = process.env.REACT_APP_CHAT_NAME || 'PUB DEV 2021'

/* -- NOTE: Socket upload file evss
// Sample 1 (12.3 kB)
<- siofu_start { name: 'coca-cola.png', mtime: 1619100476733, meta: {}, size: 12302, encoding: 'octet', id: 0 }
-> siofu_ready { id: 0, name: '1637615139703' }
<- siofu_progress { id: 0, size: 12302, start: 0, end: 12302, content: { _placeholder: true, num: 0 }, base64: false }
<- [FILE]
<- siofu_done { id: 0 }
-> siofu_chunk { id: 0 }
-> siofu_complete { id: 0, succes: true, detail: { base: '1637615139703' } }

-> siofu_error?

// Sample 2 (10.3 MB)
// ...
<- siofu_progress { size: 10312296, start: 10240000, end: 10291000, content: { _placeholder: true, num: 0 }, base64 true }
<- siofu_progress { size: 10312296, start: 10291000, end: 10312296, content: { _placeholder: true, num: 0 }, base64 true }
-- */

// const overwriteMerge = (destinationArray, sourceArray, _options) => [, ...sourceArray]
const tsSortDEC = (e1: TMessage, e2: TMessage) => e1.ts - e2.ts
const charsLimit = 2000

const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

type TUser = { socketId: string; room: string; name: string }

const statusMap: {
  [key: string]: any
} = {
  [EMessageStatus.Done]: <FaCheckCircle size={15} />,
  [EMessageStatus.Dead]: <GiDeathSkull size={15} /*color='#000'*/ />,
  [EMessageStatus.Warn]: <FiActivity size={15} /*color='#000'*/ />,
  // [EMessageStatus.Danger]: <RiErrorWarningFill size={17} /*color='#000'*/ />,
  // [EMessageStatus.Danger]: <FaFire size={14} />,
  [EMessageStatus.Danger]: <ImFire size={14} />,
  [EMessageStatus.Success]: <FaCheck size={10} />,
  'assign': <CgAssign size={18}/>,
}
const getIconByStatus = (status: EMessageStatus | 'assign', isColored: boolean) => {
  switch (true) {
    case !!statusMap[status]: return <span className={styles['abs-tail']} style={{ width: '17px', backgroundColor: isColored ? getBgColorByStatus(status) : 'inherit' }}>{statusMap[status]}</span>
    default: return null
  }
}
const getIconByStatuses = (statuses: EMessageStatus[], isColored: boolean) => {
  switch (true) {
    case statuses.length > 0:
      const res: any[] = []
      statuses.forEach((s) => {
        const icon = getIconByStatus(s, false)
        if (!!icon) {
          res.push(<span key={s} style={{ marginRight: '8px', alignSelf: 'center' }}>{icon}</span>)
        }
      })
      return res
    default: return null
  }
}
const bgColorsMap: { [key: string]: string } = {
  [EMessageStatus.Done]: 'var(--chakra-colors-gray-500)',
  [EMessageStatus.Dead]: 'var(--chakra-colors-gray-800)',
  [EMessageStatus.Warn]: '#FFDE68',
  [EMessageStatus.Danger]: '#FF9177',
  [EMessageStatus.Info]: '#408EEA',
  [EMessageStatus.Success]: '#31EAB7',
  'assign': '#FF9177',
}
const getBgColorByStatus = (s: EMessageStatus | 'assign') => {
  switch (true) {
    case !!bgColorsMap[s]: return bgColorsMap[s]
    default: return 'current'
  }
}
const colorSchemeMap: {
  [key: string]: string
} = {
  [EMessageStatus.Done]: 'gray',
  [EMessageStatus.Dead]: 'black',
  [EMessageStatus.Warn]: 'yellow',
  [EMessageStatus.Danger]: 'red',
  [EMessageStatus.Success]: 'green',
}

const kanbanStatuses = [EMessageStatus.Warn, EMessageStatus.Danger, EMessageStatus.Success, EMessageStatus.Done]
type TKanbanCard = { id: number, title: EMessageStatus, description: string }
type TKanbanState = {
  columns: {
    id: EMessageStatus
    title: string
    cards: (TMessage & TKanbanCard)[]
  }[]
}
const getInitialStatusGroups = (statuses: EMessageStatus[]): TKanbanState =>
  statuses.reduce((acc: any, status) => {
    acc.columns.push({
      id: status,
      title: status,
      cards: [],
    })
    return acc
  }, { columns: [] })

const addBlink = (ts: number) => {
  try {
    const card = document.getElementById(`card-${ts}`)
    card?.classList.add('blink_me')
  } catch (_err) {}
}
const removeBlink = (ts: number) => {
  try {
    const card = document.getElementById(`card-${ts}`)
    card?.classList.remove('blink_me')
  } catch (_err) {}
}

type TCounters = {
  total: number,
  totalCards: number,
  doneLastWeek: number,
  doneLastMonth: number,
  doneLast3Months: number,
  danger: number,
  success: number,
  users: {
    jobless: number,
    statusCountersMap: {
      [key: string]: number
    },
    statusMap: {
      [key: string]: {
        [key: string]: number
      }
    },
  },
}

export const Chat = () => {
  const { name, slugifiedRoom: room, roomRef, setRoom, isAdmin, tsMap, tsMapRef, sprintFeatureProxy, userInfoProxy, assignmentFeatureProxy, devtoolsFeatureProxy } = useContext(MainContext)
  const sprintFeatureSnap = useSnapshot(sprintFeatureProxy)
  const userInfoSnap = useSnapshot(userInfoProxy)
  const assignmentSnap = useSnapshot(assignmentFeatureProxy)
  const devtoolsFeatureSnap = useSnapshot(devtoolsFeatureProxy)

  // @ts-ignore
  const { socket, roomData, isConnected } = useSocketContext()
  const messageRef = useRef<string>('')
  const [showClearBtn, setShowClearBtn] = useState<boolean>(false)
  const resetMessage = useCallback(() => {
    messageRef.current = ''
    const input = document.getElementById('msg')
    // @ts-ignore
    if (!!input) input.value = ''
    setShowClearBtn(false)
  }, [setShowClearBtn])
  const [isTagsModalOpened, setIsTagsModalOpened] = useState<boolean>(false)
  const handleOpenTagsModal = useCallback(() => {
    setIsTagsModalOpened(true)
  }, [setIsTagsModalOpened])
  const handleCloseTagsModal = useCallback(() => {
    setIsTagsModalOpened(false)
  }, [setIsTagsModalOpened])
  const [messages, setMessages] = useState<TMessage[]>([])
  const [tsPoint, setTsPoint] = useState<number | null>(Date.now())
  const [showLoadMoreBtn, setShowLoadMoreBtn] = useState<boolean>(false)
  const lastIdRef = useRef<string | null>(null)
  const resetMessages = useCallback(() => {
    setTsPoint(Date.now())
    setMessages([])
    setShowLoadMoreBtn(false)
    lastIdRef.current = null
  }, [setMessages, setTsPoint])
  const handleReconnect = useCallback(() => {
    resetMessages()
    if (!!socket) {
      console.log('EFF: socket RECONN')
      socket.disconnect()
      socket.connect()
    }
  }, [resetMessages, socket])
  const logic = useMemo<Logic>(() => {
    return new Logic(messages)
  }, [messages])
  // @ts-ignore
  const { users, tasklist } = useContext(UsersContext)
  const history = useHistory()
  const toast = useToast()
  const [left, isMsgLimitReached] = useTextCounter({ text: messageRef.current, limit: 2000 })
  const [tokenLS, _setTokenLS, _removeTokenLS] = useLocalStorage<any>('chat.token')
  // const textFieldRef = useRef<HTMLInputElement>(null)
  const textFieldRef = useRef<HTMLTextAreaElement>(null)

  // window.onpopstate = e => handleLogout()
  //Checks to see if there's a user present
  // useEffect(() => {
  //     if (!isLogged) history.push('/')
  // }, [isLogged])

  // const debouncedSetTsPoint = useMemo(
  //   () => debounce(setTsPoint, 1000), // { leading: true, trailing: false }
  //   [setTsPoint]
  // );
  const [fullChatReceived, setFullChatReceived] = useState<boolean>(false)
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false)
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false)
  const [uploadErrorMsg, setUploadErrorMsg] = useState<null | string>(null)
  const resetUploadErrorMsg = () => {
    setUploadErrorMsg(null)
  }
  const uploadPercentageRef = useRef<number>(0)

  useEffect(() => {
    if (!!socket) {
      const msgListener = (msg: TMessage) => {
        // @ts-ignore
        setMessages((messages: TMessage[]) => [...messages, msg])
      }
      const notifListener = (notif: {
        status: UseToastOptions['status']
        title: string
        description: string
        _originalEvent?: any
      }) => {
        if (!!notif?._originalEvent) {
          console.log('-- notif._originalEvent')
          console.log(notif._originalEvent)
        }
        toast({
          position: 'top-left',

          title: notif?.title,
          description: notif?.description,
          status: notif?.status || 'info',
          duration: 20000,
          isClosable: true,
        })
      }
      const myUserDataListener = (regData: any) => {
        userInfoProxy.regData = regData
        const currentMajorVersion = pkg.version.split('.')[1]
        if (!!regData?._frontMinorVersionSupport && regData._frontMinorVersionSupport !== currentMajorVersion) {
          toast({
            position: 'top-left',
            title: `Actual version from backend: ${regData._frontMinorVersionSupport}`,
            description: `Reload reason: ${currentMajorVersion}`,
            status: 'error',
            duration: 3000,
          })
          setTimeout(() => {
            document.location.reload()
          }, 4000)
        }
        // else toast({
        //   position: 'top-left',
        //   title: `${pkg.version}`,
        //   // description: pkg.version,
        //   status: 'info',
        //   duration: 3000,
        // })
      }
      const logoutFromServerListener = () => {
        history.push('/')
      }
      const updMsgListener = ({ text, ts, editTs, status, assignedTo, assignedBy, links, position, statusChangeTs }: { statusChangeTs?: number,  position?: number, text: string, editTs?: number, status?: EMessageStatus, ts: number, assignedTo?: string[], assignedBy?: string, links?: { link: string, descr: string }[] }) => {
        setMessages((ms: TMessage[]) => {
          const newArr = [...ms]
          const targetIndex = binarySearchTsIndex({ messages: ms, targetTs: ts })
          
          if (targetIndex !== -1) {
            newArr[targetIndex].text = text
            if (!!editTs) newArr[targetIndex].editTs = editTs
            if (!!status) {
              newArr[targetIndex].status = status
            } else {
              // @ts-ignore
              if (!!newArr[targetIndex].status) delete newArr[targetIndex].status
            }
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 && assignedBy) {
              newArr[targetIndex].assignedTo = assignedTo
              newArr[targetIndex].assignedBy = assignedBy
            } else {
              if (!!newArr[targetIndex].assignedTo) delete newArr[targetIndex].assignedTo
            }
            if (!!links) {
              newArr[targetIndex].links = links
            } else {
              newArr[targetIndex].links = []
            }
            if (!!position || position === 0) newArr[targetIndex].position = position
            if (!!statusChangeTs) newArr[targetIndex].statusChangeTs = statusChangeTs
          }
          return newArr
        })
      }
      const delMsgListener = ({ ts }: { ts: number }) => {
        setMessages((ms: TMessage[]) => {
          const newArr = [...ms]
          const targetIndex = binarySearchTsIndex({ messages: ms, targetTs: ts })
          
          if (targetIndex !== -1) newArr.splice(targetIndex, 1)
          return newArr
        })
      }
      const uploadStartedListener = () => {
        setIsFileUploading(true)
        uploadPercentageRef.current = 0
      }
      const uploadProgressListener = ({ percentage }: { percentage: number }) => {
        uploadPercentageRef.current = Number(percentage.toFixed(0))
      }
      const uploadSavedListener = (data: any) => {
        console.log('-- COMPLETE')
        console.log(data)
        setIsFileUploading(false)
      }
      const uploadErrorListener = (data: { message: string, [key: string]: any }) => {
        console.log('-- ERROR')
        console.log(data)
        setIsFileUploading(false)
        if (!!data?.message) setUploadErrorMsg(data.message)
      }

      socket.on('message', msgListener)
      socket.on('message.update', updMsgListener)
      socket.on('message.delete', delMsgListener)
      socket.on('notification', notifListener)
      socket.on('my.user-data', myUserDataListener)
      socket.on('FRONT:LOGOUT', logoutFromServerListener)
      // Upload
      socket.on('upload:started', uploadStartedListener)
      socket.on('upload:progress', uploadProgressListener)
      socket.on('upload:saved', uploadSavedListener)
      socket.on('upload:error', uploadErrorListener)

      return () => {
        socket.off('message', msgListener)
        socket.off('message.update', updMsgListener)
        socket.off('message.delete', delMsgListener)
        socket.off('notification', notifListener)
        socket.off('my.user-data', myUserDataListener)
        socket.off('FRONT:LOGOUT', logoutFromServerListener)
        // Upload
        socket.off('upload:started', uploadStartedListener)
        socket.off('upload:progress', uploadProgressListener)
        socket.off('upload:saved', uploadSavedListener)
        socket.off('upload:error', uploadErrorListener)
      }
    }
  }, [socket, toast, room])

  const chatHistoryChunksCounterRef = useRef<number>(0)
  const handleLoadMore = useCallback(() => {
    chatHistoryChunksCounterRef.current += 1
    setShowLoadMoreBtn(false)
  }, [setShowLoadMoreBtn])
  const [filteredMessages, setFilteredMessages] = useState<TMessage[]>([])
  const latestFilteredMessagesRef = useLatest(filteredMessages)
  const partialOldChatListener = useCallback(({ result, nextTsPoint, isDone }: { result: TMessage[], nextTsPoint: number, isDone: boolean }) => {
    if (latestFilteredMessagesRef.current.length > 0) {
      // console.log(latestFilteredMessagesRef.current[latestFilteredMessagesRef.current.length - 1])

      // @ts-ignore
      lastIdRef.current = String(latestFilteredMessagesRef.current[0].ts)
    }
    setMessages((msgs: TMessage[]) => {
      // NOTE: Merge & filter unique & sort
      // -- TODO: refactoring?
      const key = 'ts'
      const arrayUniqueByKey = [...new Map([...result, ...msgs].map((item: TMessage) =>
      [item[key], item])).values()]

      return arrayUniqueByKey.sort(tsSortDEC)
      // --
    })
    setTsPoint(nextTsPoint)
    setFullChatReceived(isDone)
    chatHistoryChunksCounterRef.current += 1
    if (chatHistoryChunksCounterRef.current % 2 === 0) {
      setShowLoadMoreBtn(true)
      
      if (!!lastIdRef.current) {
        const domElm = document.getElementById(lastIdRef.current)
        if (!!domElm) {
          // domElm.style.border = '1px solid red'
          const container = document.getElementsByClassName('scroll-to-bottom-container')[0]
          container.scrollTo({ left: 0, behavior: 'auto', top: domElm.offsetTop })
        } else console.error('NOT FOUND')
      }
    }
  }, [setShowLoadMoreBtn])
  const getPieceOfChat = useCallback(() => {
    if (!!socket && !!tsPoint) {
      setIsChatLoading(true)
      setTimeout(() => {
        // NOTE: (про параметр targetRoom)
        // Пришлось подстраховаться, т.к. после смены комнаты все еще успевали приходить запрошенные сообщения
        // Для пользователя выглядело необычно =)
        socket.emit('getPartialOldChat', { tsPoint, room: roomRef.current }, (res: any) => {
          setIsChatLoading(false)

          try {
            const { result, nextTsPoint, isDone, targetRoom } = res

            if (!!result && targetRoom === roomRef.current)
              partialOldChatListener({ result, nextTsPoint, isDone })
            else console.log(`getPartialOldChat: SKIPED targetRoom= ${targetRoom} is not roomRef.current= ${roomRef.current}`)
          } catch (err) {
            console.log(err)
          }

        })
      }, 0)
    }
  }, [tsPoint, socket, partialOldChatListener])

  const prevRoom = useRef<string | null>(null)

  useEffect(() => {
    // NOTE: Отписаться при смене комнаты
    if (!!socket && !!prevRoom.current && prevRoom.current !== room) {
      socket.emit('unsetMe', { name, room: prevRoom.current })
    }
    if (!!room) prevRoom.current = room

    if (!!socket?.connected && !!name && !!room) {
      socket.emit('setMeAgain', { name, room: roomRef.current, token: String(tokenLS) }, (err?: string) => {
        if (!!err) {
          toast({ title: err, status: 'error', duration: 5000 })
          history.push('/')
        }
      })
      setFullChatReceived(false)
      setTsPoint(Date.now())
      setShowLoadMoreBtn(false)
      // return () => { socket.emit('unsetMe', { name, room }) }
    }
  }, [socket?.connected, toast, name, room, history])

  // useEffect(() => {
  //   console.log('EFFECT: socket?.connected', socket?.connected)
  //   if (!!socket && !!name && !!room) {
  //     if (!!socket?.connected) {
  //       socket.emit('setMeAgain', { name, room }, (err?: string) => {
  //         if (!!err) {
  //           console.log(err)
  //           toast({ title: err, status: 'error' })
  //           history.push('/')
  //         }
  //         console.log('--- setMeAgain')
  //       })
  //       setFullChatReceived(false)
  //       setTsPoint(Date.now())
  //     } // else socket.emit('unsetMe', { name, room })
  //   }
  // }, [socket?.connected, room, history, name])

  const [filters, setFilters] = useState<EMessageStatus[]>([])
  // const setFilter = useCallback((filter: EMessageStatus) => {
  //   setFilters([filter])
  // }, [setFilters])
  const toggleFilter = useCallback((filter: EMessageStatus) => {
    setFilters((state) => state.includes(filter) ? state.filter((f) => f !== filter) : [...state, filter])
  }, [setFilters])
  const resetFilters = useCallback(() => {
    setFilters([])
  }, [setFilters])
  const [assignmentExecutorsFilters, setAssignmentExecutorsFilters] = useState<string[]>([])
  useEffect(() => {
    setAssignmentExecutorsFilters([])
  }, [room])
  const handleAddAssignedToFilter = useCallback((name: string) => {
    console.log('add', name)
    setAssignmentExecutorsFilters((state: string[]) => [...new Set([...state, name])])
  }, [setAssignmentExecutorsFilters])
  const handleRemoveAssignedToFilter = useCallback((name: string) => {
    console.log('remove', name)
    setAssignmentExecutorsFilters((state: string[]) => state.filter((n) => n !== name))
  }, [setAssignmentExecutorsFilters])
  const handleResetAssignmentFilters = useCallback(() => {
    setAssignmentExecutorsFilters([])
  }, [setAssignmentExecutorsFilters])


  const [isSending, setIsSending] = useState<boolean>(false)
  const handleSendMessage = useCallback(() => {
    if (!messageRef.current) {
      toast({
        position: 'top-left',
        title: 'Sorry',
        description: 'Cant send empty msg',
        status: 'error',
        duration: 3000,
        variant: 'solid',
      })
      return
    }
    if (!roomRef.current) {
      toast({
        position: 'top-left',
        title: 'ERR',
        description: 'Try again',
        status: 'error',
        duration: 3000,
        variant: 'solid',
      })
      return
    }
    if (isMsgLimitReached) {
      toast({
        position: 'top-left',
        title: 'Sorry',
        description: 'Cant send big msg',
        status: 'error',
        duration: 7000,
        variant: 'solid',
      })
      return
    }
    const normalizedMsg = messageRef.current.trim().replace(/\n+/g, '\n') // message.replace(/\s+/g, ' ').trim()
    if (!!socket && !!normalizedMsg) {
      setIsSending(true)
      
      const newStuff: { message: string, userName: string, status?: EMessageStatus, room: string, position?: number } = {
        message: normalizedMsg,
        userName: name,
        room: roomRef.current
      }

      if (filters.length === 1 && Object.values(EMessageStatus).includes(filters[0])) newStuff.status = filters[0]
      else if (editedMessageRef.current?.status && Object.values(EMessageStatus).includes(editedMessageRef.current.status))
        newStuff.status = editedMessageRef.current.status
      
      if (!!editedMessageRef.current?.position || editedMessageRef.current?.position === 0) newStuff.position = editedMessageRef.current.position

      socket.emit('sendMessage', { ...newStuff }, () => {
        setIsSending(false)
      })
      resetMessage()
      resetEditedMessage()
    } else toast({
      position: 'top-left',
      title: 'Sorry',
      description: 'Видимо, что-то случилось =)',
      status: 'error',
      duration: 4000,
      variant: 'solid',
    })
  }, [toast, isMsgLimitReached, socket, setIsSending, resetMessage, filters])
  const handleKeyUp = (ev: any) => {
    switch (true) {
      case ev.keyCode === 13 && !ev.shiftKey:
        if (!!messageRef.current) handleSendMessage()
        break
      default:
        break
    }
  }
  const handleChange = useCallback((ev: any) => {
    messageRef.current = ev.target.value
    if (!!messageRef.current) setShowClearBtn(true)
    else setShowClearBtn(false)
  }, [])
  const hasUserInMessage = useCallback(
    (user: TUser) => {
      let result = false
      const template = `@${user.name}`

      if (messageRef.current.includes(template)) result = true

      return result
    },
    []
  )
  const handleUserClick = useCallback((user: TUser) => {
    if (!hasUserInMessage(user)) {
      messageRef.current = `@${user.name}, ${messageRef.current}`
    }
    if (!!textFieldRef.current) textFieldRef.current.focus()
  }, [])

  useEffect(() => {
    if (!room || !name) history.push('/')
  }, [])

  const { isOpen: isEditModalOpen, onOpen: handleEditModalOpen, onClose: handleEditModalClose } = useDisclosure()
  const initialEditedMessageState: TMessage = {
    text: '',
    ts: 0,
    user: name,
    name,
  }
  const [editedMessage, setEditedMessage] = useState<TMessage>(initialEditedMessageState)
  const resetEditedMessage = useCallback(() => {
    setEditedMessage(initialEditedMessageState)
    editedMessageRef.current = initialEditedMessageState
  }, [setEditedMessage])
  const editedMessageRef = useRef<TMessage>(initialEditedMessageState)
  useEffect(() => {
    editedMessageRef.current = editedMessage
    messageRef.current = editedMessage.text
  }, [useCompare([editedMessage])])
  const [isCtxMenuOpened, setIsCtxMenuOpened] = useState<boolean>(false)
  // const resetEditedMessage = () => {
  //   setEditedMessage(initialEditedMessageState)
  // }
  const handleShowCtxMenu = useCallback(() => {
    setIsCtxMenuOpened(true)
  }, [setIsCtxMenuOpened])
  const handleHideCtxMenu = useCallback(() => {
    setIsCtxMenuOpened(false)
  }, [setIsCtxMenuOpened])
  const initialRef = useRef(null)
  const handleChangeEditedMessage = useCallback((e: any) => {
    setEditedMessage((state) => ({ ...state, text: e.target.value }))
  }, [setEditedMessage])
  const handleSaveEditedMessage = useCallback(({ assignedTo }: { assignedTo?: string[] }, cb?: () => void) => {
    console.groupCollapsed('editedMessageRef.current')
    console.log(editedMessageRef.current)
    console.groupEnd()
    if (!editedMessageRef.current?.text && !editedMessageRef.current.file) {
      toast({
        position: 'top-left',
        // title: 'Sorry',
        description: 'Should not be empty',
        status: 'error',
        duration: 3000,
        variant: 'solid',
      })
      return
    }
    if (!!editedMessageRef.current?.text && editedMessageRef.current?.text.length > charsLimit) {
      toast({
        position: 'top-left',
        // title: 'Sorry',
        description: `Too big! ${charsLimit} chars, not more`,
        status: 'error',
        duration: 3000,
        variant: 'solid',
      })
      return
    }
    if (!!socket) {
      let newData: Partial<TMessage> = { text: editedMessageRef.current.text }
      if (!!editedMessageRef.current.status) newData.status = editedMessageRef.current.status
      if (!!editedMessageRef.current.assignedTo) newData.assignedTo = editedMessageRef.current.assignedTo
      if (!!assignedTo) newData.assignedTo = assignedTo
      if (!!editedMessageRef.current.links) newData.links = editedMessageRef.current.links
      if (!!editedMessageRef.current.status && !editedMessageRef.current.position) newData.position = 0
      newData = { ...newData, ...editedMessageRef.current }
      socket.emit(
        'editMessage',
        { newData, ts: editedMessageRef.current.ts, room: roomRef.current, name },
        (errMsg: string) => {
          if (!!errMsg) {
            toast({
              position: 'top-left',
              // title: 'Sorry',
              description: errMsg,
              status: 'error',
              duration: 7000,
              isClosable: true,
            })
          }
          resetEditedMessage()
        }
      )
    }
    if (!!cb) cb()
    handleEditModalClose()
  }, [socket, toast, name, handleEditModalClose, resetEditedMessage])
  // const handleKeyDownEditedMessage = (ev: any) => {
  //   if (ev.keyCode === 13 && !!room) handleSaveEditedMessage()
  // }
  const handleDeleteMessage = useCallback((ts: number) => {
    const isConfirmed = window.confirm('Вы точно хотите удалить это сообщение?')

    if (isConfirmed) {
      if (!!socket) {
        const targetTs = (!!ts && Number.isInteger(ts)) ? ts : editedMessage.ts
  
        socket.emit('deleteMessage', { ts: targetTs, room: roomRef.current, name }, (errMsg: string) => {
          if (!!errMsg) {
            toast({
              position: 'top-left',
              // title: 'Sorry',
              description: errMsg,
              status: 'error',
              duration: 7000,
              isClosable: true,
              variant: 'solid',
            })
          }
        })
      } else {
        window.alert('Похоже, проблема с соединением')
      }
    }
  }, [socket, toast, name, editedMessage])
  const [isAddLinkFormOpened, setIsAddLnkFormOpened] = useState<boolean>(false)
  const openAddLinkForm = useCallback(() => {
    setIsAddLnkFormOpened(true)
  }, [setIsAddLnkFormOpened])
  const closeAddLinkForm = useCallback(() => {
    setIsAddLnkFormOpened(false)
  }, [setIsAddLnkFormOpened])
  const handleAddLink = useCallback(() => {
    openAddLinkForm()
  }, [openAddLinkForm])
  const submitNewLink = useCallback(({ link, descr, cb }: any) => {
    if (!!socket) {
      const newData = { ...editedMessage }

      if (!!link && !!descr) {
        if (!!newData.links) {
          newData.links = [...newData.links, { link, descr }]
        } else {
          newData.links = [{ link, descr }]
        }
      }
      socket.emit(
        'editMessage',
        { newData, ts: editedMessage.ts, room: roomRef.current, name },
        () => {
          cb()
          closeAddLinkForm()
        },
      )
    }
  }, [socket, closeAddLinkForm, editedMessage])
  const handleDeleteLink = useCallback((link: string, tsMsg: number) => {
    const isConfirmed = window.confirm(`Вы уверенны? Ссылка будет удалена\n${link}`)
    if (!isConfirmed) return

    if (!!socket) {
      socket.emit(
        'editMessage:delete-link',
        { ts: tsMsg, room: roomRef.current, name, link },
      )
    }
  }, [socket, name])
  const goToExternalLink = useCallback((link: string) => {
    const isConfirmed = window.confirm(`Открыть ссылку?\n${link}`)
    if (!isConfirmed) return

    window.open(link, '_blank')
  }, [])
  const handleSetStatus = useCallback((status: EMessageStatus) => {
    if (!!socket) {
      const newData: Partial<TMessage> = { ...editedMessage, status }

      socket.emit(
        'editMessage',
        { newData, ts: editedMessage.ts, room: roomRef.current, name },
        () => {
          resetEditedMessage()
        }
      )
    }
  }, [socket, editedMessage, name, resetEditedMessage])
  const handleUnsetStatus = useCallback(() => {
    if (!!socket) {
      const newData: Partial<TMessage> = { ...editedMessage }
      delete newData.status

      socket.emit(
        'editMessage',
        { newData, ts: editedMessage.ts, room: roomRef.current, name },
        () => {
          resetEditedMessage()
        }
      )
    }
  }, [socket, editedMessage, name, resetEditedMessage])

  // --- Set my password
  const [isSetPasswordModalOpened, setIsSetPasswordModalOpened] = useState<boolean>(false)
  const handleSetPasswordModalOpen = useCallback(() => {
    setIsSetPasswordModalOpened(true)
  }, [setIsSetPasswordModalOpened])
  const handleSetPasswordModalClose = useCallback(() => {
    setIsSetPasswordModalOpened(false)
  }, [setIsSetPasswordModalOpened])
  // ---
  // --- My info:
  const [isMyInfoModalOpened, setIsMyInfoModalOpened] = useState<boolean>(false)
  const handleMyInfoModalOpen = useCallback(() => {
    setIsMyInfoModalOpened(true)
  }, [setIsMyInfoModalOpened])
  const handleMyInfoModalClose = useCallback(() => {
    setIsMyInfoModalOpened(false)
  }, [setIsMyInfoModalOpened])
  // ---
  // --- Tasklist:
  const [isTasklistModalOpened, setTasklistModalOpened] = useState<boolean>(false)
  const handleTasklistModalOpen = useCallback(() => {
    setTasklistModalOpened(true)
  }, [setTasklistModalOpened])
  const handleTasklistModalClose = useCallback(() => {
    setTasklistModalOpened(false)
  }, [setTasklistModalOpened])
  // ---
  // --- Search user:
  const [isSearchUserModalOpened, setSearchUserModalOpened] = useState<boolean>(false)
  const handleSearchUserModalOpen = useCallback(() => {
    if (!!editedMessage.assignedTo) {
      toast({
        position: 'top-left',
        title: 'Sorry',
        description: `Already assigned to ${editedMessage.assignedTo.join(', ')}`,
        status: 'warning',
        duration: 7000,
        isClosable: true,
        variant: 'solid',
      })
      return
    }
    setSearchUserModalOpened(true)
  }, [setSearchUserModalOpened, toast, editedMessage])
  const handleSearchUserModalClose = useCallback(() => {
    setSearchUserModalOpened(false)
  }, [setSearchUserModalOpened])
  // ---

  // const heighlLimitParentClass = useBreakpointValue({ md: "height-limited-md", base: "height-limited-sm" })
  const [downToMd] = useMediaQuery(`(max-width: ${md}px)`)
  const [upToMd] = useMediaQuery(`(min-width: ${md + 1}px)`)
  const [upToSm] = useMediaQuery(`(min-width: ${sm + 1}px)`)
  const [upToLg] = useMediaQuery(`(min-width: ${lg + 1}px)`)
  const completedTasksLen = useMemo(() => !!tasklist ? tasklist.filter(({ isCompleted }: any) => isCompleted).length : 0, [useCompare([tasklist])])
  const percentage = useMemo(() => {
    if (!tasklist || tasklist.length === 0 || !Array.isArray(tasklist)) return 0

    const all = tasklist.length
    const completed = completedTasksLen

    return Math.round(completed * 100 / all)
  }, [useCompare([tasklist]), completedTasksLen])

  const [inViewRef, inView, _entry] = useInView({
    /* Optional options */
    threshold: 0,
  })
  const [inViewRef2, inView2, _entry2] = useInView({ threshold: 0 })

  // const _infinityChatLoadRef = useRef<NodeJS.Timeout>()
  useEffect(() => {
    if (!showLoadMoreBtn && (inView || inView2)) {
      // if (!!_infinityChatLoadRef.current) clearTimeout(_infinityChatLoadRef.current)
      // _infinityChatLoadRef.current = setTimeout(getPieceOfChat, 1000)
      setTimeout(getPieceOfChat, 1000)
    }
  }, [inView, inView2, getPieceOfChat, showLoadMoreBtn])

  const rendCounter = useRef<number>(0)
  useEffect(() => {
    if (isConnected) rendCounter.current += 1
    const isFirstRender = rendCounter.current === 1
    if (isFirstRender) return
    // setFullChatReceived(false)
    // setTsPoint(Date.now())
    // if (isConnected) getPieceOfChat()
    if (isConnected) {
      // NOTE: При реконнекте нужно обнновить контент - проще всего очистить и начать загружать заново
      setMessages([])
      // toast({ position: 'top-left', description: `Connect ${rendCounter.current}`, status: 'info', duration: 10000, isClosable: true })
    }
  }, [isConnected])

  const [additionalTsToShow, setAdditionalTsToShow] = useState<number[]>([])

  const addAdditionalTsToShow = useCallback((ts: number) => {
    setAdditionalTsToShow((arr) => [...arr, ts])
  }, [setAdditionalTsToShow])
  const resetAdditionalTsToShow = useCallback(() => {
    setAdditionalTsToShow([])
  }, [setAdditionalTsToShow])

  const { formData, handleInputChange, resetForm } = useForm({
    searchText: '',
  })
  
  const enabledTags = useMemo<string[]>(() => formData.searchText.split(' ').filter((w: string) => w[0] === '#'), [formData.searchText])
  const handleToggleTag = useCallback((tag: string) => {
    if (formData.searchText.includes(tag)) {
      const value = formData.searchText.replace(tag, '')
      handleInputChange({ target: { name: 'searchText', value: value.replace(/\s\s+/g, ' ').trim() } })
    } else {
      const value = `${formData.searchText} ${tag}`
      handleInputChange({ target: { name: 'searchText', value: value.replace(/\s\s+/g, ' ').trim() } })
    }
  }, [formData.searchText])
  // const [debouncedSearchText, setDebouncedSearchText] = useState('');
  // const [, _cancel] = useDebounce(
  //   () => {
  //     // setState('Typing stopped');
  //     setDebouncedSearchText(formData.searchText);
  //   },
  //   1000,
  //   [formData.searchText]
  // );
  const debouncedSearchText = useDebouncedValue(formData.searchText, 500)
  // useEffect(() => {
  //   if (!formData.searchText && filters.length === 0) resetAdditionalTsToShow()
  // }, [formData.searchText, filters.length, resetAdditionalTsToShow])
  useEffect(() => {
    // if (!formData.searchText)
    resetAdditionalTsToShow()
  }, [debouncedSearchText, filters.length, resetAdditionalTsToShow])
  // useEffect(() => {
  //   resetAdditionalTsToShow()
  // }, [filters.length, resetAdditionalTsToShow])

  const [isSearchModeEnabled, setIsSearchModeEnabled] = useState<boolean>(false)
  const handleToggleSearch = useCallback(() => {
    setIsSearchModeEnabled((s) => !s)
  }, [setIsSearchModeEnabled])
  const handleDisableSearch = useCallback(() => {
    setIsSearchModeEnabled(false)
  }, [setIsSearchModeEnabled])

  const [isDrawerMenuOpened, setIsDrawerMenuOpened] = useState<boolean>(false)
  const handleOpenDrawerMenu = useCallback(() => {
    setIsDrawerMenuOpened(true)
  }, [setIsDrawerMenuOpened])
  const handleCloseDrawerMenu = useCallback(() => {
    setIsDrawerMenuOpened(false)
  }, [setIsDrawerMenuOpened])

  // -- ROOMS SAMPLE
  const [roomlistLS, setRoomlistLS] = useLocalStorage<{ name: string, ts: number }[]>('chat.roomlist', [])
  
  const updateRoomTsInLS = useCallback((roomName: string) => {
    if (!!window) {
      let roomlistLS: any

      try {
        roomlistLS = JSON.parse(window.localStorage.getItem('chat.roomlist') || '[]')
        // @ts-ignore
        const rooms = !!roomlistLS ? roomlistLS.filter(({ name }) => !!name) : []
        const newRooms: any[] = []

        if (rooms.length > 0) {
          rooms.forEach(({ name, ts }: any, i: number) => {
            if (name === roomName) {
              newRooms.push({ name, ts: Date.now() })
            } else {
              newRooms.push({ name, ts })
            }
          })
        }

        setRoomlistLS(newRooms)
      } catch (err) {}
    }
  }, [])

  const handleLogout = useCallback(async () => {
    const isConfirmed = window.confirm('Вы уверенны?')
    if (!isConfirmed) return

    const jwtLogout = await axios.post(`${REACT_APP_API_URL}/chat/api/auth/logout`, {})
      .then((res: any) => res.data)
      .catch((err: any) => err)
    
    if (jwtLogout.ok) {
      toast({ position: 'top-left', description: jwtLogout?.message || 'Unlogged', status: 'info', duration: 3000, isClosable: true })
    }

    if (!!socket) socket.emit('logout', { name, room })
    updateRoomTsInLS(roomRef.current)

    setTimeout(() => { history.push('/') }, 0)
  }, [updateRoomTsInLS, socket, room, name])
  const handleRoomClick = useCallback((room) => {
    // console.log(room, 'CLICKED')
    updateRoomTsInLS(room)
  }, [])
  // --
  
  // -- FILTERS EXP
  // V1
  // const filteredMessages = useMemo(() => logic.getFiltered({ filters, searchText: debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters }), [logic, filters, debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters])
  // const allImagesMessagesLightboxFormat = useMemo(() => logic.getAllImagesLightboxFormat(), [logic])

  // V2: Web Worker
  const [tags, setTags] = useState<string[]>([])
  const [allImagesMessagesLightboxFormat, setAllImagesMessagesLightboxFormat] = useState<any[]>([])
  const timers = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const abortEventsMap = useRef<{ [key: string]: number }>({})
  const filteredKanbanStatuses = useMemo(() => filters.length > 0 ? kanbanStatuses.filter((s) => filters.includes(s)) : kanbanStatuses, [filters])
  const [kanbanState, setKanbanState] = useState<TKanbanState>(getInitialStatusGroups(filteredKanbanStatuses))

  const messagesTotalCounter = useMemo<number>(() => messages.length, [messages.length])
  const getEconomyText = useCallback((eventDataType) => `economy= ${abortEventsMap.current[eventDataType] || 0}`, [])
  const economyCounterInc = useCallback((eventDataType) => {
    if (typeof abortEventsMap.current[eventDataType] === 'undefined') {
      abortEventsMap.current[eventDataType] = 0
    } else {
      abortEventsMap.current[eventDataType] += 1
    }
  }, [])
  const workerEventLog = useCallback((eventDataType) => {
    console.log(`🔥 Web Worker: ${eventDataType}; ${getEconomyText(eventDataType)}`)
  }, [getEconomyText])
  
  useEffect(() => {
    webWorkersInstance.filtersWorker.onmessage = (
      $event: {
        [key: string]: any,
        data: { type: string, result: TMessage[] | { reactKanban: any, total: number, totalCards: number, doneLastWeek: number }, perf: number }
      }
    ) => {
      try {
        const eventDataType = $event.data.type
  
        if (!!timers.current[eventDataType]) {
          console.log(`Web Worker: aborted ${eventDataType} (${$event.data.perf} ms)`)
          clearTimeout(timers.current[eventDataType])
          economyCounterInc(eventDataType)
        }

        switch ($event.data.type) {
          case 'getFilteredMessages':
            timers.current[$event.data.type] = setTimeout(() => {
              // @ts-ignore
              setFilteredMessages($event.data.result)
              workerEventLog(eventDataType)
            }, 50)
            break;
          case 'getTags':
            timers.current[$event.data.type] = setTimeout(() => {
              // @ts-ignore
              setTags(getNormalizedWordsArr($event.data.result))
              workerEventLog(eventDataType)
            }, 50)
            break;
          case 'getAllImagesLightboxFormat':
            timers.current[$event.data.type] = setTimeout(() => {
              // @ts-ignore
              setAllImagesMessagesLightboxFormat($event.data.result)
              workerEventLog(eventDataType)
            }, 50)
            break;
          case 'getStatusKanban':
            timers.current[$event.data.type] = setTimeout(() => {
              // console.log($event.data.result)
              // @ts-ignore
              setKanbanState($event.data.result.reactKanban)
              workerEventLog(eventDataType)
            }, 0)
            break;
          default: break;
        }
      } catch (err) {
        console.log(err)
      }
    }

    return () => {
      for (const key in timers.current) if (!!timers.current[key]) clearTimeout(timers.current[key])
    }
  }, [])

  useEffect(() => {
    webWorkersInstance.filtersWorker.postMessage({ type: 'getFilteredMessages', filters, searchText: debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters, messages })
  }, [messages, useCompare([assignmentExecutorsFilters]), debouncedSearchText, additionalTsToShow])
  useEffect(() => {
    webWorkersInstance.filtersWorker.postMessage({ type: 'getAllImagesLightboxFormat', messages })
  }, [messages])
  useEffect(() => {
    webWorkersInstance.filtersWorker.postMessage({ type: 'getTags', messages })
  }, [messages])
  useEffect(() => {
    webWorkersInstance.filtersWorker.postMessage({
      type: 'getStatusKanban',
      messages: filteredMessages,
      statuses: filteredKanbanStatuses,
      // traceableUsers: (!!assignmentSettingsLS && !!assignmentSettingsLS[room]) ? Object.keys(assignmentSettingsLS[room]) : []
    })
  }, [filteredMessages, filteredKanbanStatuses])
  // --
  
  const [isGalleryOpened, setIsGalleryOpened] = useState<boolean>(false)
  const [clickedImageSrc, setClickedImageSrc]= useState<string | null>(null)
  const handleOpenGallery = useCallback((src: string) => {
    setIsGalleryOpened(true)
    setClickedImageSrc(src)
  }, [setIsGalleryOpened, setClickedImageSrc])
  const handleCloseGallery = useCallback(() => {
    setIsGalleryOpened(false)
  }, [setIsGalleryOpened])

  const hasNews: boolean = useMemo(() => {
    return hasNewsInRoomlist(roomlistLS || [], tsMap, roomRef.current)
  }, [useCompare([roomlistLS, tsMap])])

  const onUserAssign = useCallback((name: string) => {
    if (!!editedMessage?.assignedTo && Array.isArray(editedMessage.assignedTo) && editedMessage.assignedTo.length > 0) {
      toast({
        position: 'top-left',
        title: 'Sorry',
        description: 'For one user only',
        status: 'warning',
        duration: 7000,
        isClosable: true,
        variant: 'solid',
      })
      return
    }
    if (!!editedMessage) {
      handleSaveEditedMessage({ assignedTo: [name] }, () => {
        handleSearchUserModalClose()
        toast({
          position: 'top-left',
          title: 'Assigned',
          description: `to ${name}`,
          status: 'success',
          duration: 7000,
          isClosable: true,
          variant: 'solid',
        })
      })
    }
  }, [editedMessage, toast, handleSearchUserModalClose, handleSaveEditedMessage])

  const handleUnassignFromUser = useCallback((message: TMessage, unassignFromUserName: string) => {
    if (!!socket) {
      const { assignedTo, ...rest } = message
      const newData: TMessage = { ...rest }

      if (!!message.assignedTo && Array.isArray(message.assignedTo) && message.assignedTo.length > 0) {
        const newAssignedArr = message.assignedTo.filter((un) => un !== unassignFromUserName)

        if (newAssignedArr.length > 0) newData.assignedTo = newAssignedArr
      }

      socket.emit('editMessage', { newData, ts: message.ts, room: roomRef.current, name }, (errMsg: string) => { if (!!errMsg) toast({ position: 'top-left', description: errMsg, status: 'error', duration: 7000, isClosable: true, variant: 'solid' }) })
    }
  }, [socket, name])

  // -- Assignment feature switcher
  const [afLS, setAfLS] = useLocalStorage<{ [key: string]: number }>('chat.assignment-feature')
  useEffect(() => {
    if (!!roomRef.current)
      assignmentFeatureProxy.isFeatureEnabled = afLS?.[roomRef.current] === 1
  }, [afLS])
  const setAFLSRoom = useCallback((val: number) => {
    setAfLS((oldState) => {
      const newState: any = {}

      // NOTE: #migration
      for (const key in oldState) {
        if (typeof key === 'string' && key !== '0') newState[key] = oldState[key]
      }

      newState[room] = val

      return newState
    })
  }, [room, setAfLS])
  const isAssignmentFeatureEnabled = useMemo(() => !!afLS?.[room], [afLS, room])
  const toggleAssignmentFeature = useCallback((e: any) => {
    setAFLSRoom(e.target.checked ? 1 : 0)
  }, [setAFLSRoom])
  // --

  const resetSearchAndFiltersAndAssignmentFilters = useCallback(() => {
    resetFilters()
    resetForm()
    handleResetAssignmentFilters()
  }, [resetFilters, resetForm, handleResetAssignmentFilters])

  // const [isEmojiOpened, setIsEmojiOpened] = useState<boolean>(false)
  // const handleOpenEmoji = useCallback(() => { setIsEmojiOpened(true) }, [setIsEmojiOpened])
  // const handleCloseEmoji = useCallback(() => { setIsEmojiOpened(false) }, [setIsEmojiOpened])
  // const handleSelectEmojies = useCallback((value: string) => {
  //   messageRef.current = `${messageRef.current.trim()} ${value}`
  // }, [])

  const handleOpenExternalLink = useCallback(openExternalLink, [])
  const handleSetQuickStruct = useCallback(() => {
    messageRef.current = `┣ ${messageRef.current || 'root'}
┃ ┣ a
┃ ┃ ┣ a1
┃ ┃ ┃ ┣ a1.1
┃ ┃ ┃ ┗ a1.2
┃ ┃ ┗ a2
┃ ┣ b`
  const input = document.getElementById('msg')
  // @ts-ignore
  if (!!input) input.value = messageRef.current
  setShowClearBtn(true)
  }, [setShowClearBtn])
  const isLogged = useMemo(() => userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser, [userInfoSnap.regData?.registryLevel])

  const handleRemoveFromSprint = useCallback(async (ts: number) => {
    // console.log(editedMessage)
    const data = { ts, room_id: room, username: name }
    const result = await axios.post(`${REACT_APP_API_URL}/chat/api/common-notifs/remove`, data)
      .then((res) => res.data)
      .catch((err) => err)

    if (result.ok && result.ts) {
      if (!!sprintFeatureProxy.commonNotifs[String(result.ts)])
        delete sprintFeatureProxy.commonNotifs[String(result.ts)]
    }
  }, [room, name])
  const handleAddCommonNotif = useCallback(async ({ ts, tsTarget, text, original }: any) => {
    const data = { room_id: room, ts, tsTarget, username: name, text, original }
    const result = await axios.post(`${REACT_APP_API_URL}/chat/api/common-notifs/add`, {
      ...data,
    })
      .then((res) => {
        return res.data
      })
      .catch((err) => err)
    if (result.ok && !!result?.stateChunk && !!result.ts) {
      sprintFeatureProxy.commonNotifs = {
        ...sprintFeatureProxy.commonNotifs,
        [String(ts)]: {
          text: result.stateChunk[String(result.ts)].text,
          ts,
          tsTarget: result.stateChunk[String(result.ts)].tsTarget,
        }
      }
    }
  }, [room, name])

  const [isDatepickerOpened, setIsDatepickerOpened] = useState<boolean>(false)
  const handleOpenDatePicker = useCallback(() => {
    setIsDatepickerOpened(true)
  }, [setIsDatepickerOpened])
  const handleCloseDatePicker = useCallback(() => {
    setIsDatepickerOpened(false)
  }, [setIsDatepickerOpened])
  const onUpdateTargetDate = useCallback((tsTarget: number) => {
    const ts = editedMessage.ts
    const text = editedMessage.text
    handleAddCommonNotif({ ts, tsTarget, text, original: editedMessage })
  }, [handleAddCommonNotif, editedMessage])

  // -- SPRINT
  const [sprintSettingsLS, setSprintSettingsLS] = useLocalStorage<{ [key: string]: { isEnabled: boolean } }>('chat.sprint-feature.custom-settings', {})
  const updateSprintSetting4TheRoom = useCallback((room_id: string, value: boolean) => {
    const newState: { [key: string]: { isEnabled: boolean } } = { ...sprintSettingsLS }

    if (!newState[room_id]) {
      newState[room_id] = { isEnabled: value }
    } else {
      for (const _room in sprintSettingsLS) {
        if (room_id !== _room) {
          newState[_room] = sprintSettingsLS[_room]
        } else {
          newState[room_id] = { isEnabled: value }
        }
      }
    }
    setSprintSettingsLS(newState)
  }, [setSprintSettingsLS, sprintSettingsLS])
  const toggleSprintFeature = useCallback(() => {
    const newVal = !sprintFeatureSnap.isFeatureEnabled
    
    updateSprintSetting4TheRoom(room, newVal)
    sprintFeatureProxy.isFeatureEnabled = newVal
  }, [updateSprintSetting4TheRoom, room])

  useEffect(() => {
    sprintFeatureProxy.isFeatureEnabled = sprintSettingsLS?.[room]?.isEnabled || false
    sprintFeatureProxy.commonNotifs = {}
    sprintFeatureProxy.tsUpdate = Date.now()
    // - NOTE: For loading indicator (TODO: isUILoaderEnabled)
    sprintFeatureProxy.isEmptyStateConfirmed = false
    sprintFeatureProxy.isPollingWorks = false
    // -
  }, [room])
  // --

  const toggleDevtoolsFeature = useCallback(() => {
    devtoolsFeatureProxy.isFeatureEnabled = !devtoolsFeatureProxy.isFeatureEnabled
  }, [])

  const handleCheckPOST = useCallback(async () => {
    if (document.hidden || !isLogged) return
    // NOTE: If false - than browser tab is active

    const data = { room_id: room, tsUpdate: sprintFeatureSnap.tsUpdate }
    const result = await axios.post(`${REACT_APP_API_URL}/chat/api/common-notifs/check-room-state`, data)
      .then((res) => res.data)
      .catch((err) => err)

    switch (true) {
      case (result instanceof Error):
        sprintFeatureProxy.isPollingWorks = false
        break;
      case result.code === 'not_found': // EAPIRoomNotifsCode.NotFound:
        sprintFeatureProxy.isPollingWorks = true
        sprintFeatureProxy.isEmptyStateConfirmed = true
        break;
      default:
        sprintFeatureProxy.isPollingWorks = true
        if (!!result.state && Object.keys(result.state).length === 0) {
          sprintFeatureProxy.isEmptyStateConfirmed = true
        }
        break;
    }

    if (result.ok && result.tsUpdate !== sprintFeatureSnap.tsUpdate) {
      try {
        sprintFeatureProxy.commonNotifs = result.state
        if (Object.keys(result.state).length > 0) {
          sprintFeatureProxy.isEmptyStateConfirmed = false
        } else {
          sprintFeatureProxy.isEmptyStateConfirmed = true
        }
      } catch (err) {
        console.log(err)
      }

      sprintFeatureProxy.tsUpdate = result.tsUpdate
    }
  }, [room, isLogged, sprintFeatureSnap.tsUpdate, document.hidden])

  const handleCloseMenuBar = useCallback(() => {
    handleCloseDrawerMenu()
    updateRoomTsInLS(room)
  }, [room, updateRoomTsInLS, handleCloseDrawerMenu])

  const AccordionStuff = useMemo(() => {
    return (
      <AccordionSettings
        onEditMessage={(m) => {
          setEditedMessage(m)
          handleEditModalOpen()
        }}
        registryLevel={userInfoSnap.regData?.registryLevel || 0}
        isAssignmentFeatureEnabled={isAssignmentFeatureEnabled}
        logic={logic}
        onAddAssignedToFilters={handleAddAssignedToFilter}
        onRemoveAssignedToFilters={handleRemoveAssignedToFilter}
        assignmentExecutorsFilters={assignmentExecutorsFilters}
        onResetFilters={handleResetAssignmentFilters}
        onSetFilters={setFilters}
        activeFilters={filters}
        defaultAccordionItems={[
          {
            uniqueKey: 'roomlist',
            accordionPanelContent: (
              <Roomlist
                resetMessages={resetMessages}
                onCloseMenuBar={handleCloseMenuBar}
                handleRoomClick={handleRoomClick}
              />
            ),
            accordionButtonContent: (
              <Flex alignItems="center">
                <Text fontWeight="400" fontSize="md" letterSpacing="0">
                  My Rooms
                </Text>
                {hasNews && <Box ml={2} h={2} w={2} borderRadius="100px" bg='green.300'></Box>}
              </Flex>
            ),
          },
        ]}
      />
    )
  }, [
    logic,
    isAssignmentFeatureEnabled,
    userInfoSnap.regData?.registryLevel,
    handleAddAssignedToFilter,
    handleRemoveAssignedToFilter,
    assignmentExecutorsFilters,
    handleResetAssignmentFilters,
    setFilters,
    useCompare([filters]),
    resetMessages,
    handleCloseMenuBar,
    handleRoomClick,
    hasNews,
    setEditedMessage,
    handleEditModalOpen,
  ])

  const mode = useColorMode()
  const isFiltersPresetDisabledCondition = useMemo(() => 
    ((filters.every((f) => [EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn].includes(f) && filters.length === 3) && (filters.includes(EMessageStatus.Success) && filters.includes(EMessageStatus.Danger) && filters.includes(EMessageStatus.Warn)))),
    [useCompare([filters])]
  )

  const debouncedEditedMessageText = useDebouncedValue(editedMessage?.text || '', 1000)
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState<boolean>(false)
  useEffect(() => {
    if (upToMd) setIsBottomSheetVisible(true)
  }, [])
  const toggleBottomSheet = useCallback(() => {
    setIsBottomSheetVisible((s) => !s)
  }, [setIsBottomSheetVisible])
  const handleCloseBottomSheet = useCallback(() => {
    setIsBottomSheetVisible(false)
  }, [setIsBottomSheetVisible])

  const nextPositionRef = useRef<number>(0)
  const prevPositionRef = useRef<number>(0)
  const handleCardDragEnd = useCallback((
    card: TMessage & TKanbanCard,
    source: { fromColumnId: string, fromPosition: number },
    dest: { toColumnId: string, toPosition: number },
    isNewCard?: boolean
  ) => { // board: any, card: any, source: any, dest: any
    // console.log('-- handleCardDragEnd')

    if (!isLogged) {
      toast({
        position: 'top-left',
        title: 'Sorry',
        description: 'For logged users only!',
        status: 'error',
        duration: 7000,
      })
      return
    }
    if (card.user === 'pravosleva' && card.user !== name) {
      toast({
        position: 'top-left',
        title: 'Sorry',
        description: `This action allowed for ${card.user} only!`,
        status: 'error',
        duration: 7000,
      })
      return
    }

    const oldStatus = source.fromColumnId
    const newStatus = dest.toColumnId
    const oldPosition = source.fromPosition
    const newPosition = dest.toPosition
    const _isSameColumn = oldStatus === newStatus
    const isMoveUpInSameColumn = _isSameColumn && source.fromPosition > dest.toPosition
    const isMoveDownInSameColumn = _isSameColumn && source.fromPosition < dest.toPosition
    const getIsReplacePositionInOtherColumn = (i: number) => {
      console.log(`-- old elm pos= ${i}, new elm pos= ${dest.toPosition}`)
      return !_isSameColumn && i === dest.toPosition
    }
    const getIsUpPositionInOtherColumn = (i: number) => !_isSameColumn && i < dest.toPosition
    const getIsDownPositionInOtherColumn = (i: number) => !_isSameColumn && i > dest.toPosition

    prevPositionRef.current = newPosition - 1
    nextPositionRef.current = newPosition + 1
    
    const { id, title, description, ...rest } = card
    // console.log('--', oldStatus !== newStatus || (_isSameColumn && oldPosition !== dest.toPosition))
    if (oldStatus !== newStatus || (_isSameColumn && oldPosition !== dest.toPosition)) {
      const newData = { ...rest, status: newStatus, position: newPosition }

      for (const group of kanbanState.columns) {
        if (group.id === newStatus) {
          group.cards.forEach((_card, i) => {
            if (_card.ts === card.ts) {
              // NOTE: Skip
              console.log('-- skip 0')
            } else {
              let position = i

              switch (true) {
                case isMoveUpInSameColumn:
                case getIsReplacePositionInOtherColumn(i):
                case getIsUpPositionInOtherColumn(i):
                  if (i < newPosition) {}
                  else if (i === newPosition) position += 1
                  else position += 1
                  break
                case isMoveDownInSameColumn:
                  if (i < newPosition) {
                    // NOTE: Skip
                  }
                  else if (i === newPosition) position -= 1
                  else position += 1
                  break
                case getIsDownPositionInOtherColumn(i):
                  console.log('-- CASE 2: isDownPositionInOtherColumn')
                  if (i < newPosition) {
                    console.log('-- CASE 2.1')
                  }
                  else if (i === newPosition) {
                    position += 1
                    console.log('-- CASE 2.2')
                  }
                  else {
                    position += 1
                    console.log('-- CASE 2.3')
                  }
                  break
                default:
                  console.log('-- UNDEFINED CASE!')
                  break
              }

              if (!!socket) socket.emit(
                'editMessage',
                { newData: { ..._card, position }, ts: _card.ts, room: roomRef.current, name }
              )
              // prevPositionRef.current += 1
              nextPositionRef.current += 1
            }
          })
        }
      }

      if (!!socket) {
        if (!isNewCard) {
          socket.emit(
            'editMessage',
            { newData, ts: newData.ts, room: roomRef.current, name },
            // () => {}
          )
        } else {
          console.log(card)
          setEditedMessage(card)
          setTimeout(handleSendMessage, 0)
        }
      }
    } else {
      console.log('-- skip 1')
    }
  }, [editedMessage, name, socket, kanbanState, setEditedMessage, handleSendMessage, isLogged])

  const handleCardRemove = (card: TMessage & TKanbanCard) => {
    try {
      // To DEL status or not?
      const isConfirmed = window.confirm('Удалить из доски?')

      if (isConfirmed) {
        const { title, description, id, ...newData } = card
        delete newData.status
        setEditedMessage(newData)
        setTimeout(() => handleSaveEditedMessage({}), 0)
      }
    } catch (err) {
      console.log(err)
    }
  }
  const handleAddToSprintKanbanCard = useCallback((card: TKanbanCard) => () => {
    const { id, title, description, ...rest } = card
    resetEditedMessage()

    setTimeout(() => {
      // console.groupCollapsed('setEditedMessage()')
      // console.log(rest)
      // console.groupEnd()
      // @ts-ignore
      setEditedMessage(rest)
      handleOpenDatePicker()
    }, 100)
  }, [resetEditedMessage, setEditedMessage, handleOpenDatePicker])
  const handleRemoveFromSprintKanbanCard = useCallback((message) => () => {
    const isConfirmed = window.confirm('Вы точно хотите удалить это из спринта?')

    if (isConfirmed) {
      resetEditedMessage()

      setTimeout(() => {
        setEditedMessage(message)
        handleRemoveFromSprint(message.ts)
      }, 100)
    }
  }, [setEditedMessage, handleRemoveFromSprint])
  const [getRef, setRef] =  useDynamicRefs()
  const listenersMap = useRef<{[key: string]: { mouseenter: (_arg: any) => void, mouseleave: (_arg: any) => void }}>({})
  const timersMap = useRef<any>({})
  useEffect(() => {
    // console.log('-- EFF: ev listener')
    // const fnsMap = {}
    filteredMessages.forEach(({ ts }) => {
      try {
        const chatMsgContainerRef = getRef(String(ts))
        // @ts-ignore
        if (!!chatMsgContainerRef.current) {
          listenersMap.current[String(ts)] = {
            mouseenter: function() {
              // console.log(this)
              setTimeout(() => addBlink(ts), 0)
              timersMap.current[String(ts)] = setTimeout(() => removeBlink(ts), 3000)
            },
            mouseleave: function() {
              if (!!timersMap.current[String(ts)]) {
                clearTimeout(timersMap.current[String(ts)])
                setTimeout(() => removeBlink(ts), 0)
              }
            },
          }
        }
        // @ts-ignore
        chatMsgContainerRef.current.addEventListener('mouseenter', listenersMap.current[String(ts)].mouseenter)
        // @ts-ignore
        chatMsgContainerRef.current.addEventListener('mouseleave', listenersMap.current[String(ts)].mouseleave)
        
      } catch (_err) {
        console.log('ERR 2')
      }
    })

    return () => {
      filteredMessages.forEach(({ ts }) => {
        try {
          const chatMsgContainerRef = getRef(String(ts))
          // @ts-ignore
          chatMsgContainerRef.current.removeEventListener('mouseenter', listenersMap.current[String(ts)].mouseenter)
          // @ts-ignore
          chatMsgContainerRef.current.removeEventListener('mouseleave', listenersMap.current[String(ts)].mouseleave)
          if (!!timersMap.current[String(ts)]) {
            setTimeout(() => removeBlink(ts), 0)
            clearTimeout(timersMap.current[String(ts)])
          }
        } catch (err) {
          console.log('ERR 1')
        }
      })
    }
  }, [filteredMessages, getRef])

  return (
    <>
      <FixedSearch
        searchText={formData.searchText}
        name='searchText'
        onChange={handleInputChange}
        onClear={() => {
          resetForm()
          handleDisableSearch()
        }}
        isOpened={isSearchModeEnabled}
        onClose={handleDisableSearch}
      />

      {/* <SearchInModal
        isOpened={isSearchModeEnabled}
        text={formData.searchText}
        onClose={handleDisableSearch}
        onChange={handleInputChange}
        onClear={() => {
          resetForm()
          handleDisableSearch()
        }}
      /> */}

      <DatepickerModal
        // key={initialUncheckedTs}
        isOpened={isDatepickerOpened}
        onClose={handleCloseDatePicker}
        onSubmit={onUpdateTargetDate}
        initialTs={Date.now()}
        // content={() => <pre>{JSON.stringify(editedTask.current, null, 2)}</pre>}
        title="Deadline"
      />
      {/* upToMd && (
        <EmojiPickerModal
          isOpened={isEmojiOpened}
          onClose={handleCloseEmoji}
          onSubmit={handleSelectEmojies}
        />
      ) */}
      <SearchUserModal
        isOpened={isSearchUserModalOpened}
        onClose={handleSearchUserModalClose}
        onSelectItem={onUserAssign}
        selectItemButtonText='Assign'
      />
      <GalleryModal
        isOpened={isGalleryOpened}
        onClose={handleCloseGallery}
        defaultSrc={clickedImageSrc}
        messages={messages}
      />
      <TasklistModal
        isOpened={isTasklistModalOpened}
        onClose={handleTasklistModalClose}
        data={tasklist}
      />
      <MyInfoModal
        isOpened={isMyInfoModalOpened}
        onClose={handleMyInfoModalClose}
        data={userInfoSnap.regData}
      />
      <SetPasswordModal
        isOpened={isSetPasswordModalOpened}
        onClose={handleSetPasswordModalClose}
      />
      <AddLinkFormModal
        isOpened={isAddLinkFormOpened}
        onClose={closeAddLinkForm}
        onSubmit={submitNewLink}
      />
      <TagsInModal
        isOpened={isTagsModalOpened}
        tags={tags}
        onClose={handleCloseTagsModal}
        onToggeTag={handleToggleTag}
        enabledTags={enabledTags}
      />

      <ContextMenu
        id="same_unique_identifier"
        onShow={handleShowCtxMenu}
        onHide={handleHideCtxMenu}
      >
        {
          Object.values(EMessageStatus).map((statusCode: EMessageStatus) => {
            if (editedMessage.status === statusCode) return null
            return (
              <CtxMenuItem key={statusCode} className={statusCode} data={{ foo: 'bar' }} onClick={() => handleSetStatus(statusCode)}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>{!!getIconByStatus(statusCode, false) && <div style={{ marginRight: '8px' }}>{getIconByStatus(statusCode, false)}</div>}<div>Status <b>{capitalizeFirstLetter(statusCode)}</b></div></div>
              </CtxMenuItem>
            )
          })
        }
        {!!editedMessage.status && (
          <CtxMenuItem className='unset-status' data={{ foo: 'bar' }} onClick={() => handleUnsetStatus()}>
            Unset status
          </CtxMenuItem>
        )}
        <CtxMenuItem data={{ foo: 'bar' }} onClick={handleEditModalOpen}>
          Edit
        </CtxMenuItem>
        <CtxMenuItem data={{ foo: 'bar' }} onClick={handleDeleteMessage}>
          Delete
        </CtxMenuItem>
        {
          isAssignmentFeatureEnabled && (
            <CtxMenuItem data={{ foo: 'bar' }} onClick={handleSearchUserModalOpen} className={'assign'}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', background: 'inherit' }}>{!!getIconByStatus('assign', false) && <div style={{ marginRight: '8px' }}>{getIconByStatus('assign', false)}</div>}<div><b>Assign</b></div></div>
            </CtxMenuItem>
          )
        }
        <CtxMenuItem data={{ foo: 'bar' }} onClick={handleAddLink}>
          Add link
        </CtxMenuItem>
      </ContextMenu>

      <Modal
        size={upToMd ? 'md' : 'full'}
        initialFocusRef={initialRef}
        finalFocusRef={textFieldRef}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      >
        <ModalOverlay />
        <ModalContent
          // rounded='2xl'
        >
          <ModalHeader>
            Edit
          </ModalHeader>
          <ModalCloseButton rounded='3xl' />
          <ModalBody
            p={0}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {!!debouncedEditedMessageText && (
                <div style={{
                  // padding: '5px 0 5px 0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}>
                  <pre style={{
                    fontSize: '0.8em',
                    border: '1px solid inherit',
                    padding: '5px',
                    marginBottom: '10px',
                    backgroundColor: 'gray',
                    color: '#FFF',
                    borderRadius: 0,
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflowY: 'auto',
                  }}>{debouncedEditedMessageText}</pre>
                </div>
              )}
              
              <div
                style={{
                  padding: upToMd ? '0 var(--chakra-space-6)' : '0 var(--chakra-space-6) 0 var(--chakra-space-20)'
                }}
              >
                <FormControl>
                  {/* <FormLabel>Text</FormLabel> */}
                  <Textarea
                    style={{
                      backgroundColor: mode.colorMode === 'dark' ? 'var(--chakra-colors-blackAlpha-600)' : 'var(--chakra-colors-blackAlpha-600)',
                      color: mode.colorMode === 'dark' ? 'inherit' : '#FFF'
                    }}
                    isInvalid={!editedMessage?.text}
                    resize="vertical"
                    placeholder="Message"
                    ref={initialRef}
                    // onKeyDown={handleKeyDownEditedMessage}
                    // value={editedMessage?.text}
                    defaultValue={editedMessage?.text}
                    onChange={handleChangeEditedMessage}
                    fontSize='lg'
                    rows={10}
                  />
                </FormControl>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              // @ts-ignore
              onClick={handleSaveEditedMessage}
              size='sm'
              rounded='2xl'
            >
              Save
            </Button>
            <Button size='sm' rounded='2xl' onClick={handleEditModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className={styles['main-wrapper']}>
        {
          upToMd && (
            <div style={{
              width: `calc(100vw - ${roomDesktopWidth}px)`,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Heading
                as="h1"
                size="3xl"
                textAlign="center"
                mb="8"
                fontFamily="Bahiana"
              >
                {/* REACT_APP_CHAT_NAME */}
                {room}
              </Heading>
            </div>
          )
        }
        <Flex
          className={styles["room"]}
          flexDirection="column"
          width={{ base: '100%', md: `${roomDesktopWidth}px` }}
          height={{ base: '100%', sm: 'auto' }}
        >
          <Heading
            className={styles["heading"]}
            as="h4"
            p={[4, 4]}
            bgColor={mode.colorMode === 'dark' ? 'gray.600' : 'gray.300'}
            color={mode.colorMode === 'dark' ? 'white' : 'inherit'}
          >
            <Flex alignItems="center" justifyContent="flex-start">
              <IconButton
                // colorScheme="gray"
                aria-label="Menu"
                icon={<FiMenu size={18} />}
                // justifySelf="flex-end"
                isRound
                onClick={handleOpenDrawerMenu}
                mr={2}
                colorScheme={assignmentExecutorsFilters.length > 0 ? 'blue' : hasNews ? 'green': 'gray'}
              />
              <Drawer
                isOpen={isDrawerMenuOpened}
                placement="left"
                // initialFocusRef={firstField}
                onClose={handleCloseDrawerMenu}
              >
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerCloseButton rounded='3xl' />
                  <DrawerHeader borderBottomWidth="1px">
                    {room}
                  </DrawerHeader>

                  <DrawerBody>
                    <Stack spacing={4} mt={2}>
                      {/* <Box><Text>The room features</Text></Box> */}
                      <Grid templateColumns='repeat(3, 1fr)' gap={2}>
                        <Menu autoSelect={false}>
                          <MenuButton
                            // as={IconButton}
                            as={Button}
                            // icon={<FiList size={18} />}
                            // isRound="true"
                            // mr={4}
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<HiOutlineMenuAlt2 size={18}/>}
                            size='sm'
                            rounded='2xl'
                          >
                            Tools
                          </MenuButton>
                          <MenuList
                            zIndex={1001}
                            _dark={{ bg: "gray.600" }}
                            // _hover={{ bg: "gray.500", color: 'white' }}
                            // _expanded={{ bg: "gray.800" }}
                            // _focus={{ boxShadow: "outline" }}
                            rounded='2xl'
                          >
                            <MenuItem
                              // _hover={{ bg: "gray.500", color: 'white' }}
                              // _focus={{ bg: "gray.500", color: 'white' }}
                              minH="40px"
                              key="tasklist-btn"
                              onClick={handleTasklistModalOpen}
                            >
                              <Text fontSize="md" fontWeight='bold'>Tasklist{tasklist?.length > 0 ? ` ${percentage}% (${completedTasksLen} of ${tasklist.length})` : ''}</Text>
                            </MenuItem>
                            <MenuDivider />
                            <MenuOptionGroup defaultValue="asc" title={`Users online: ${users.length}`}>
                            <div
                              style={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                              }}
                            >
                              {users &&
                                users.map((user: TUser) => {
                                  return (
                                    <MenuItem minH="40px" key={user.name} onClick={() => { handleUserClick(user) }} isDisabled={name === user.name}>
                                      <Text fontSize="md">{getTruncated(user.name)}</Text>
                                    </MenuItem>
                                  )
                                })
                              }
                            </div>
                            </MenuOptionGroup>
                            <MenuDivider />
                              {isAdmin && (
                                <MenuItem
                                  minH="40px"
                                  key="adm-btn"
                                  onClick={() => {
                                    history.push('/admin')
                                  }}
                                >
                                  <Text fontSize="md" fontWeight='bold'>Admin panel</Text>
                                </MenuItem>
                              )}
                              {
                                userInfoSnap.regData?.registryLevel !== ERegistryLevel.TGUser && (
                                  <MenuItem
                                    minH="40px"
                                    key="set-passwd-btn"
                                    onClick={handleSetPasswordModalOpen}
                                  >
                                    <Text fontSize="md" fontWeight='bold'>Set my password</Text>
                                  </MenuItem>
                                )
                              }

                              <MenuItem
                                minH="40px"
                                key="my-info-btn"
                                onClick={handleMyInfoModalOpen}
                              >
                                <Text fontSize="md" fontWeight='bold'>My info</Text>
                              </MenuItem>
                          </MenuList>
                        </Menu>
                        {/*
                        <Button onClick={handleSearchUserModalOpen} as={Button} mr={2} colorScheme="gray" variant="outline" leftIcon={<CgSearch size={18}/>}>
                          Search user tst
                        </Button> */}
                        {
                          !!allImagesMessagesLightboxFormat && allImagesMessagesLightboxFormat.length > 0 && (
                            <Button
                              size='sm'
                              colorScheme="gray"
                              variant="outline"
                              leftIcon={<FcGallery color='#FFF' size={18} />}
                              onClick={() => { handleOpenGallery(allImagesMessagesLightboxFormat[0].src) }}
                              // mr={2}
                              rounded='2xl'
                            >Photos</Button>
                          )
                        }
                        <CopyToClipboard
                          text={`http://pravosleva.ru/express-helper/chat/#/?room=${room}`}
                          onCopy={() => {
                            toast({
                              position: 'top-left',
                              title: 'Link copied',
                              description: `http://pravosleva.ru/express-helper/chat/#/?room=${room}`,
                              status: 'success',
                              duration: 5000,
                              isClosable: true,
                            })
                          }}
                          >
                          <Button
                            size='sm'
                            // mr={2}
                            colorScheme="gray"
                            variant="outline"
                            rounded='2xl'
                          >Copy Link</Button>
                        </CopyToClipboard>
                      </Grid>
                      
                      <>
                        {userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser && (
                          <SwitchSection
                            label='Assignment feature'
                            id='assignment-feature-switcher'
                            onChange={toggleAssignmentFeature}
                            isChecked={isAssignmentFeatureEnabled}
                            description='Эта фича добавит дополнительный пункт Assign контекстного меню сообщения в чате для назначения задачи на пользователя, если рассматривать сообщение как задачу'
                          />
                        )}
                        {userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser && (
                          <SwitchSection
                            label='Sprint feature'
                            id='sprint-feature-switcher'
                            onChange={toggleSprintFeature}
                            isChecked={sprintFeatureSnap.isFeatureEnabled}
                            description='Эта фича позволит добавить задачи в спринт (они видны всем)'
                          />
                        )}
                        {userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser && (
                          <SwitchSection
                            label='Devtools'
                            id='devtools-feature-switcher'
                            onChange={toggleDevtoolsFeature}
                            isChecked={devtoolsFeatureSnap.isFeatureEnabled}
                            description='Эта фича позволит настроить доп. опции прозводительности, посмотреть аналитику потребления, возможно, что-то еще'
                          />
                        )}
                        
                        {AccordionStuff}
                      </>
                    </Stack> 
                  </DrawerBody>

                  <DrawerFooter borderTopWidth="1px">
                    <ColorModeSwitcher
                      mr={2}
                      colorScheme="gray"
                      rounded='3xl'
                    />
                    <Button rounded='3xl' variant="outline" onClick={handleCloseDrawerMenu}>
                      Close
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <Menu
                autoSelect={false}
                // onOpen={resetFilters}
                closeOnSelect={!upToMd}
              >
                <MenuButton
                  mr={2}
                  as={IconButton}
                  icon={<FiFilter size={18} />}
                  // isRound
                  colorScheme={filters.length > 0 ? "blue": "gray"}
                />
                <MenuList
                  zIndex={1001}
                  _dark={{ bg: "gray.600" }}
                >
                  <MenuOptionGroup defaultValue="asc" title={`Filters${!!tsPoint ? ` / ${getNormalizedDateTime3(tsPoint)}` : ''}`}></MenuOptionGroup>
                  <div>
                    {upToMd && (
                      <MenuItem
                        closeOnSelect
                        minH="40px"
                      >
                        <Text color={mode.colorMode === 'light' ? "red" : 'red.200' } fontSize="md" fontWeight='bold' display='flex'>Close Menu</Text>
                      </MenuItem>
                    )}
                    {
                      Object.values(EMessageStatus).map((status) => {
                        const Icon = !!getIconByStatus(status, false) ? <span style={{ marginRight: '8px', alignSelf: 'center' }}>{getIconByStatus(status, false)}</span> : null
                        const counter = logic.getCountByFilter(status)
                        const isFilterEnabled = filters.includes(status)
                        // const isDisabed = counter === 0 || isFilterEnabled
                        const isDisabed = counter === 0

                        return (
                          <MenuItem
                            minH="40px"
                            key={status}
                            onClick={() => toggleFilter(status)}
                            isDisabled={isDisabed}
                          >
                            <Text fontSize="md" fontWeight='bold' display='flex'>{Icon}{capitalizeFirstLetter(status)} ({counter})</Text>
                            {isFilterEnabled && <Text fontSize="md" fontWeight='bold' display='flex' marginLeft='auto'>✅</Text>}
                          </MenuItem>
                        )
                      })
                    }
                    <MenuItem
                      minH="40px"
                      onClick={() => setFilters([EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn])}
                      isDisabled={logic.getCountByFilters([EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn]) === 0 || isFiltersPresetDisabledCondition}
                    >
                      <Text fontSize="md" fontWeight='bold' display='flex'>{getIconByStatuses([EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn], false)}In progress ({logic.getCountByFilters([EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn])})</Text>
                    </MenuItem>
                  </div>
                  {
                    filters.length > 0 && (
                      <MenuItem
                        minH="40px"
                        onClick={resetFilters}
                        // color='red.500'
                        // icon={<IoMdClose size={17} />}
                        closeOnSelect
                      >
                        <Text color={mode.colorMode === 'light' ? "red" : 'red.200' } fontSize="md" fontWeight='bold' display='flex'><span>Reset filters</span></Text>
                      </MenuItem>
                    )
                  }
                </MenuList>
              </Menu>

              <Flex alignItems="flex-start" flexDirection="column" flex={{ base: '1', sm: 'auto' }} mr={2}>
                {/* <Heading fontSize="lg">{room.slice(0, 1).toUpperCase() + room.slice(1)}</Heading> */}
                <Heading fontSize='lg' fontFamily='Jura'>
                  {room} {isChatLoading && !!tsPoint && (
                    <Spinner size='xs' />
                  )}
                </Heading>
                <Flex alignItems="center">
                  <Text mr="2" fontWeight="400" fontSize="md" letterSpacing="0">
                    {getTruncated(name)}
                  </Text>
                  <Box h={2} w={2} borderRadius="100px" bg={isConnected ? 'green.300' : 'red.300'}></Box>
                </Flex>
              </Flex>

              <IconButton
                colorScheme={!!formData.searchText ? "blue": "gray"}
                aria-label="Search"
                icon={<CgSearch size={18} />}
                justifySelf="flex-end"
                onClick={handleToggleSearch}
                mr={2}
              />

              <IconButton
                aria-label="Logout"
                // colorScheme={isMsgLimitReached ? 'red' : 'gray'}
                isRound
                icon={<IoMdLogOut size={18} />}
                onClick={handleLogout}
                // disabled={!message}
                // isLoading={isSending}
              >
                Logout
              </IconButton>
            </Flex>
          </Heading>

          <Box
            w='100%'
            h={1}
            m={[0, 0]}
            backgroundColor={mode.colorMode === 'light' ? 'whiteAlpha.700' : 'gray.500'}
          >
            {tasklist?.length > 0 && <Progress value={percentage} size="xs" colorScheme="green" backgroundColor={mode.colorMode === 'light' ? 'whiteAlpha.700' : 'gray.500'} />}
          </Box>

          <ScrollToBottom
            scrollViewClassName='scroll-to-bottom-container'
            initialScrollBehavior='auto'
            debounce={100}
            followButtonClassName='follow-button'
            className={clsx(styles["messages"], { [styles["height-limited-md"]]: upToMd, [styles["height-full-auto-sm"]]: downToMd })}
            debug={false}
          >{/* INF LOADER 1/3 */}
            {showLoadMoreBtn ? (
              <Flex p={4} justifyContent='center' style={{ width: '100%' }}>
                <Button size='sm' isDisabled={isChatLoading} leftIcon={isChatLoading ? <Spinner size='xs' /> : undefined} rightIcon={<BiUpArrowAlt size={15} />} rounded='2xl' onClick={handleLoadMore}>Load more</Button>
              </Flex>
            ) : (
              <Flex p={4} ref={inViewRef2} skip={inView || showLoadMoreBtn} alignItems="center" justifyContent='center' width='100%' opacity=".35">
                <Box mr="2">---</Box>
                {/* !!tsPoint ? <Spinner fontSize="1rem" /> : <BiMessageDetail fontSize="1.1rem" /> */}
                <Text fontWeight="400">
                  {!!tsPoint
                    ? `Загрузка от ${getNormalizedDateTime2(tsPoint)} и старше`
                    : 'Больше ничего нет'
                  }
                </Text>
                <Box ml="2">---</Box>
              </Flex>
            )}
            {filteredMessages.map((message: TMessage & { _next?: { ts: number, isHidden: boolean } }, i, _arr) => {
              const { user, text, ts, editTs, status, file, _next, assignedTo, assignedBy, links = [] } = message
              // const isLastOfFiltered = i === arr.length -1
              const isMyMessage = user === name
              const date = getNormalizedDateTime(ts)
              const editDate = !!editTs ? getNormalizedDateTime(editTs) : null
              // const isLast = i === messages.length - 1
              const isNextOneBtnEnabled = _next?.isHidden
              const handleClickCtxMenu = () => setEditedMessage(message)
              let contextTriggerRef: any = null;
              const toggleMenu = (e: any) => {
                // @ts-ignore
                  if(!!contextTriggerRef) contextTriggerRef.handleContextClick(e);
              }

              if (!!file) {
                return (
                  <Fragment key={`${user}-${ts}-${editTs || 'original'}-${status || 'no-status'}`}>
                    {/* INF LOADER 2/3
                      (i === 20 && !!tsPoint) && !showLoadMoreBtn && (
                        <Flex ref={inViewRef} alignItems="center" justifyContent='center' width='100%' opacity=".35" mb={4}>
                          <Box mr="2">---</Box><Text fontWeight="400">{`Загрузка от ${getNormalizedDateTime2(tsPoint)} и старше`}</Text><Box ml="2">---</Box>
                        </Flex>
                      )
                    */}
                    <Image
                      message={message}
                      setEditedMessage={setEditedMessage}
                      onEditModalOpen={handleEditModalOpen}
                      onDeleteMessage={handleDeleteMessage}
                      onAddAdditionalTsToShow={addAdditionalTsToShow}
                      onOpenGallery={handleOpenGallery}
                    />
                  </Fragment>
                )
              }
              const hasLinks = !!links && Array.isArray(links)
              const needAssignmentBtns = userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser
                && sprintFeatureSnap.isFeatureEnabled
                && !file && !!status && status !== EMessageStatus.Done

              return (
                // @ts-ignore
                <div ref={setRef(String(ts))} key={`${user}-${ts}-${editTs || 'original'}-${status || 'no-status'}-${!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 ? assignedTo.join(',') : 'not_assigned'}`}>
                  {/* INF LOADER 3/3
                    i === 20 && !!tsPoint && (
                      <Flex ref={inViewRef} alignItems="center" justifyContent='center' width='100%' opacity=".35" mb={4}>
                        <Box mr="2">---</Box><Text fontWeight="400">{`Загрузка от ${getNormalizedDateTime2(tsPoint)} и старше`}</Text><Box ml="2">---</Box>
                      </Flex>
                    )
                  */}
                  <Box
                    id={String(ts)}
                    className={clsx(styles['message'], { [styles['my-message']]: isMyMessage, [styles['oponent-message']]: !isMyMessage })}
                    // style={transform}
                    mt={1}
                    mb={2}
                  >
                    <Text
                      fontSize="sm"
                      // opacity=".8"
                      mb={1}
                      className={clsx(styles["from"], { [styles['is-hidden']]: /* (isMyMessage && ((!!formData.searchText || filters.length > 0) ? false : !isLast)) */ false })}
                      // textAlign={isMyMessage ? 'right' : 'left'}
                    >
                      <b>{user}</b>{' '}
                      <span className={styles["date"]}>
                        {date}
                        {!!editDate && <b>{' '}Edited</b>}
                      </span>
                    </Text>
                    <div
                      style={{
                        display: 'flex',
                        // position: 'relative'
                      }}
                      className={styles['opponent-ava-wrapper']}
                    >
                      {!isMyMessage && <UserAva size={30} name={user} mr='.5rem' />}
                      <div className={clsx(styles["msg"], { [styles['edited-message']]: isCtxMenuOpened && ts === editedMessage.ts }, !!status ? styles[status] : undefined)}>
                        {isMyMessage ? (
                          <ContextMenuTrigger
                            id="same_unique_identifier"
                            key={`${user}-${ts}-${editTs || 'original'}-${status || 'no-status'}`}
                            ref={c => contextTriggerRef = c}
                          >
                            <Text
                              fontSize="md"
                              // p=".3rem .9rem"
                              display="inline-block"
                              // bg="white"
                              // color="white"
                              // onContextMenu={handleClickCtxMenu}
                              onContextMenu={(_e: any) => {
                                // e.preventDefault()
                                handleClickCtxMenu()
                              }}
                              onClick={(e: any) => {
                                handleClickCtxMenu()
                                toggleMenu(e)
                              }}
                              // order={isMyMessage ? 1 : 2}
                            >
                              {text}
                              {/* <div className='abs-edit-btn'><RiEdit2Fill /></div> */}
                            </Text>
                          </ContextMenuTrigger>
                        ) : (
                          <Text display="inline-block" fontSize="md" className={clsx(!!status ? [styles[status]] : undefined)}
                            // p=".3rem .9rem"
                          >
                            {text}
                          </Text>
                        )}
                        {!!status && getIconByStatus(status, true)}
                      </div>
                    </div>
                  </Box>
                  {assignmentSnap.isFeatureEnabled && !!assignedTo && assignedTo.length > 0 && (
                    <AssignedBox
                      isMyMessage={isMyMessage}
                      assignedTo={assignedTo}
                      assignedBy={assignedBy || 'ERR'}
                      onUnassign={(userName: string) => {
                        const isConFirmed = window.confirm(`Вы точно хотите отвязать задачу от пользователя ${userName}?`) 
                        if (isConFirmed) handleUnassignFromUser(message, userName)
                      }}
                    />
                  )}
                  {
                    hasLinks
                    ? (
                      <Flex spacing={2} className={stylesBase['flex-wraper-spaced-2']} flexWrap='wrap' justifyContent='flex-end' style={{ width: '100%' }}>
                        {links.map(({ link, descr }, i) => (
                          <ButtonGroup
                            size='sm'
                            isAttached
                            variant='solid'
                            mb={2}
                            key={`${link}-${i}`}
                            colorScheme='gray'
                          >
                            <Button
                              mr='-px'
                              onClick={() => goToExternalLink(link)}
                              borderRadius='full'
                            >
                              {capitalizeFirstLetter(descr)}
                            </Button>
                            {isMyMessage && (
                              <IconButton
                                borderRadius='full'
                                aria-label='Remove link'
                                icon={<IoMdClose color='inherit' size={14} />}
                                onClick={(e: any) => {
                                  e.stopPropagation()
                                  handleDeleteLink(link, ts)
                                }}
                              />
                            )}
                          </ButtonGroup>
                        ))}
                        {
                          needAssignmentBtns && (
                            <>
                              {
                                !sprintFeatureSnap.commonNotifs[String(ts)] ? (
                                  <Button
                                    isDisabled={sprintFeatureSnap.inProgress.includes(ts) || !sprintFeatureSnap.isPollingWorks}
                                    size='sm'
                                    borderRadius='full'
                                    onClick={() => {
                                      console.groupCollapsed('setEditedMessage()')
                                      console.log(message)
                                      console.groupEnd()
                                      setEditedMessage(message)
                                      handleOpenDatePicker()
                                    }}
                                    rightIcon={<FiArrowRight color="inherit" size={14} />}
                                    leftIcon={<BsFillCalendarFill size={14} />}
                                    mb={2}
                                  >Add to Sprint</Button>
                                ) : (
                                  <Button
                                    isDisabled={sprintFeatureSnap.inProgress.includes(ts) || !sprintFeatureSnap.isPollingWorks}
                                    size='sm'
                                    borderRadius='full'
                                    onClick={() => {
                                      const isConfirmed = window.confirm('Вы точно хотите удалить это из спринта?')
                                      if (isConfirmed) {
                                        setEditedMessage(message)
                                        handleRemoveFromSprint(ts)
                                      }
                                    }}
                                    rightIcon={<IoMdClose color='inherit' size={14} />}
                                    mb={2}
                                  >Remove from Sprint</Button>
                                )
                              }
                            </>
                          )
                        }
                      </Flex>
                    ) : (
                      needAssignmentBtns && (
                        <Flex justifyContent='flex-end' alignItems='center' style={{ width: '100%' }} mb={2}>
                          {
                            !sprintFeatureSnap.commonNotifs[String(ts)] ? (
                              <Button
                                isDisabled={sprintFeatureSnap.inProgress.includes(ts) || !sprintFeatureSnap.isPollingWorks}
                                size='sm'
                                borderRadius='full'
                                onClick={() => {
                                  setEditedMessage(message)
                                  handleOpenDatePicker()}
                                }
                                rightIcon={<FiArrowRight color="inherit" size={14} />}
                                leftIcon={<BsFillCalendarFill size={14} />}
                              >Add to Sprint</Button>
                            ) : (
                              <Button
                                isDisabled={sprintFeatureSnap.inProgress.includes(ts) || !sprintFeatureSnap.isPollingWorks}
                                size='sm'
                                borderRadius='full'
                                onClick={() => {
                                  const isConfirmed = window.confirm('Вы точно хотите удалить это из спринта?')
                                  if (isConfirmed) {
                                    setEditedMessage(message)
                                    handleRemoveFromSprint(ts)
                                  }
                                }}
                                rightIcon={<IoMdClose color='inherit' size={14} />}
                              >Remove from Sprint</Button>
                            )
                          }
                        </Flex>
                      )
                    )
                  }
                  {isNextOneBtnEnabled && (
                    <Box className={stylesBase['centered-box']}>
                      <button
                        className={clsx(stylesBase['special-btn'], stylesBase['special-btn-sm'], stylesBase['dark-btn'])}
                        onClick={() => { addAdditionalTsToShow(_next.ts) }}
                      >
                        Next One
                      </button>
                    </Box>
                  )}
                </div>
              )
            })}
          </ScrollToBottom>
          {
            isLogged && (
              <div className={clsx(styles['service-flex-row'], styles[`service-flex-row_${mode.colorMode}`])}>
                {!!uploadErrorMsg && (
                  <>
                    <div><button className={clsx('no-line-breaks', stylesBase['special-btn'], stylesBase['special-btn-md'], stylesBase['dark-btn'], stylesBase['green'])} onClick={resetUploadErrorMsg}><span style={{ display: 'flex', alignItems: 'center' }}>Got it<span style={{ marginLeft: '7px' }}><FaCheck size={13} color='var(--chakra-colors-green-300)' /></span></span></button></div>
                    <div style={{ color: 'var(--chakra-colors-red-400)', width: 'auto', minWidth: '150px' }}>Upload Err: {uploadErrorMsg}</div>
                  </>
                )}
                {name === 'pravosleva' && assignmentExecutorsFilters.length === 0 && filters.length === 0 && !formData.searchText && userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser && !uploadErrorMsg && (
                  <>
                    <UploadInput id='siofu_input' isDisabled={isFileUploading} label='Img' />
                    {isFileUploading && (
                      <div><b>Upload...&nbsp;{uploadPercentageRef.current}&nbsp;%</b></div>
                    )}
                  </>
                )}
                {/*upToMd && isLogged && (
                  <IconButton
                    size='sm'
                    aria-label="EMOJI"
                    colorScheme='cyan'
                    variant='outline'
                    isRound
                    icon={<FaRegSmile size={20} />}
                    onClick={handleOpenEmoji}
                    isDisabled={isChatLoading}
                  >
                    EMOJI
                  </IconButton>
                )*/}
                {isLogged && (
                  <div><button
                    className={clsx(stylesBase['special-btn'], stylesBase['special-btn-md'], stylesBase['dark-btn'])}
                    style={{ display: 'flex', alignItems: 'center' }}
                    onClick={handleSetQuickStruct}><span style={{ marginRight: '7px' }}>┣</span><span>Struct</span></button></div>
                )}
                {/* isLogged && !!messageRef.current && (
                  <div><button className={clsx(stylesBase['special-btn'], stylesBase['special-btn-md'], stylesBase['dark-btn'])} onClick={() => { messageRef.current = '' }}>Clear</button></div>
                )*/}
                {/* isLogged && (
                  <div>
                    <button className={clsx(stylesBase['special-btn'], stylesBase['special-btn-md'], stylesBase['dark-btn'])} onClick={handleOpenTagsModal}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        Tags
                        <span style={{ marginLeft: '7px' }}><AiFillTags size={17} color={enabledTags.length > 0 ? 'var(--chakra-colors-blue-300)' : 'inherit'} /></span>
                      </span>
                    </button>
                  </div>
                )*/}
                {isLogged && (
                  <IconButton
                    size='sm'
                    aria-label="TAGS"
                    colorScheme='teal'
                    variant='outline'
                    isRound
                    icon={<AiFillTags size={20} />}
                    onClick={handleOpenTagsModal}
                    // isDisabled={isChatLoading}
                  >
                    TAGS
                  </IconButton>
                )}
                <IconButton
                  size='sm'
                  aria-label="RECONNECT"
                  colorScheme='green'
                  variant='outline'
                  isRound
                  icon={<BiRefresh size={20} />}
                  onClick={handleReconnect}
                  isDisabled={isChatLoading}
                >
                  RECONNECT
                </IconButton>
                {isLogged && (
                  <IconButton
                    size='sm'
                    aria-label="TASKLIST"
                    colorScheme='blue'
                    variant='outline'
                    isRound
                    icon={<GoChecklist size={20} />}
                    onClick={handleTasklistModalOpen}
                    isDisabled={isTasklistModalOpened}
                  >
                    TASKLIST
                  </IconButton>  
                )}
                {
                  upToMd && (
                    <IconButton
                      size='sm'
                      aria-label="BSH"
                      colorScheme='blue'
                      variant={isBottomSheetVisible ? 'solid' : 'outline'}
                      isRound
                      icon={<BsTable size={15} />}
                      onClick={toggleBottomSheet}
                    >
                      BSH
                    </IconButton> 
                  )
                } 
                {isLogged && showClearBtn && (
                  <IconButton
                    size='sm'
                    aria-label="DEL"
                    colorScheme='red'
                    variant='outline'
                    isRound
                    icon={<IoMdClose size={20} />}
                    onClick={resetMessage}
                  >
                    DEL
                  </IconButton>
                )}
                {(filters.length > 0 || !!formData.searchText || assignmentExecutorsFilters.length > 0) && (
                  <>
                    <Tag
                      size='lg'
                      borderRadius='full'
                      variant='outline'
                      colorScheme='blue'
                      marginLeft='auto'
                    >
                      <TagLabel><b>{filteredMessages.length}</b> {getTruncated(formData.searchText, 50)}</TagLabel>
                      <TagCloseButton onClick={resetSearchAndFiltersAndAssignmentFilters} />
                    </Tag>
                  </>
                )}
              </div>
            )
          }
          {
            isLogged ? (
              <div className={styles["form"]}>
                {/* <input ref={textFieldRef} type="text" placeholder='Enter Message' value={message} onChange={handleChange} onKeyDown={handleKeyDown} /> */}
                <Textarea
                  id="msg"
                  isInvalid={isMsgLimitReached}
                  resize="none"
                  ref={textFieldRef}
                  placeholder="Enter Message"
                  // value={messageRef.current}
                  onChange={handleChange}
                  onKeyUp={handleKeyUp}
                  variant='unstyled'
                  pl={4}
                  fontWeight='md'
                  bgColor={mode.colorMode === 'dark' ? 'gray.600' : 'gray.300'}
                  color={mode.colorMode === 'dark' ? 'white' : 'inherit'}
                />
                <label htmlFor="msg" className={styles['absolute-label']}>{left} left</label>
                <IconButton
                  aria-label="Send"
                  // colorScheme={isMsgLimitReached ? 'red' : !!message ? 'blue' : 'gray'}
                  // colorScheme='blue'
                  bgColor={mode.colorMode === 'dark' ? 'gray.500' : 'gray.100'}
                  color={mode.colorMode === 'dark' ? 'white' : 'inherit'}
                  isRound
                  icon={<RiSendPlaneFill size={15} />}
                  onClick={handleSendMessage}
                  // disabled={!messageRef.current}
                  isLoading={isSending}
                >
                  Send
                </IconButton>
              </div>
            ) : (
              <Flex
                style={{ height: '130px' }}
                justifyContent='center'
                alignItems='center'
                // bgColor='gray.600'
                className={styles['sticky-bottom-mobile']}
                // bgColor={mode.colorMode === 'dark' ? 'gray.600' : 'gray.300'}
              >
                <Button rightIcon={<FaTelegramPlane size={18} />} size='lg' style={{ borderRadius: 'var(--chakra-radii-full)' }} colorScheme='blue' variant='solid' onClick={handleOpenExternalLink(`${REACT_APP_PRAVOSLEVA_BOT_BASE_URL}?start=invite-chat_${room}`)}>Зайти в чат через бота</Button>
              </Flex>
            )
          }
        </Flex>
      </div>
      {
        sprintFeatureSnap.isFeatureEnabled && (
          <>{
            devtoolsFeatureSnap.isSprintPollUsedInMainThreadOnly ? (
              <PollingComponent interval={5000} promise={handleCheckPOST} resValidator={(_data: any) => false} onSuccess={() => {}} onFail={console.log} />
            ) : (
              <CheckRoomSprintPolling
                interval={5000}
                payload={{
                  url: `${REACT_APP_API_URL}/chat/api/common-notifs/check-room-state`,
                  method: 'POST',
                  body: { room_id: room, tsUpdate: sprintFeatureSnap.tsUpdate },
                }}
                validateBeforeRequest={(payload) => !!payload.body?.room_id && !document.hidden}
                cbOnUpdateState={({ state }: any) => {
                  // if (isDev) console.log('- state effect: new state!')
                  const result = state
                  if (!!result) {
                    switch (true) {
                      case (result instanceof Error):
                        sprintFeatureProxy.isPollingWorks = false
                        break;
                      case result.code === 'not_found': // EAPIRoomNotifsCode.NotFound:
                        sprintFeatureProxy.isPollingWorks = true
                        sprintFeatureProxy.isEmptyStateConfirmed = true
                        break;
                      default:
                        sprintFeatureProxy.isPollingWorks = true
                        if (!!result.state && Object.keys(result.state).length === 0) {
                          sprintFeatureProxy.isEmptyStateConfirmed = true
                        }
                        break;
                    }
                
                    if (result.ok && result.tsUpdate !== sprintFeatureSnap.tsUpdate) {
                      try {
                        sprintFeatureProxy.commonNotifs = result.state
                        if (Object.keys(result.state).length > 0) {
                          sprintFeatureProxy.isEmptyStateConfirmed = false
                        } else {
                          sprintFeatureProxy.isEmptyStateConfirmed = true
                        }
                      } catch (err) {
                        console.log(err)
                      }
                      
                      sprintFeatureProxy.tsUpdate = result.tsUpdate
                    }
                  }
                }}
              />
            )
          }</>
        )
      }
      {
        upToLg && (
          <Widget position='top-left' isHalfHeight>
            {AccordionStuff}
          </Widget>
        )
      }
      {
        upToLg && (
          <Widget position='bottom-left' isHalfHeight>
            <>
              <SpecialTabs />
            </>
          </Widget>
        )
      }
      {/*
        upToLg && (
          <Widget position='top-right'>
            <TasklistContent data={tasklist} />
          </Widget>
        )
      */}
      {
        upToSm && (
          <FixedBottomSheet
            isOpened={isBottomSheetVisible}
            onClose={handleCloseBottomSheet}
            mainSpaceRenderer={() => (
              <MainSpace
                // counters={{ ...counters }}
                messagesTotalCounter={messagesTotalCounter}
                dateDescr={!!tsPoint ? getNormalizedDateTime3(tsPoint) : ''}
                filteredMessages={filteredMessages}
                filteredKanbanStatuses={filteredKanbanStatuses}
                room={room}
                isFiltersActive={filters.length > 0 || assignmentExecutorsFilters.length > 0}
              />
            )}
          >
            <Board
              onCardDragEnd={handleCardDragEnd}
              disableColumnDrag
              allowRemoveCard
              // onCardRemove={handleCardRemove}

              renderColumnHeader={({ title, id }: { id: EMessageStatus, title: string, cards: TKanbanCard[] }) => {
                return (
                  <div>
                    <div className='react-kanban-card__title'>{title}</div>
                    <div style={{
                      // border: '1px solid red',
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Button
                        onClick={() => {
                          const prompt = window.prompt('')
                          if (!!prompt?.trim()) {
                            const newCard: any = {
                              ...initialEditedMessageState,
                              text: prompt,
                              status: id,
                              position: 0,
                            }
                            // setEditedMessage(newCard)
                            // setTimeout(handleSendMessage, 0)

                            handleCardDragEnd(
                              newCard,
                              { fromColumnId: 'noname-special-for-new-message', fromPosition: 1000000 },
                              { toColumnId: id, toPosition: 0 },
                              true
                            )
                          }
                        }}
                        size='xs'
                        borderRadius='full'
                        isFullWidth
                        colorScheme={colorSchemeMap[id] || 'blue'}
                        variant='solid'
                        leftIcon={<FaPlus size={9} />}
                      >New</Button>
                    </div>
                  </div>
                )
              }}
              renderCard={(card: TMessage & TKanbanCard, { removeCard, dragging }: any) => {
                const descrStrings = card.description.split('\n')
                return (
                  <div id={`card-${card.ts}`} className={clsx('react-kanban-card', { ['react-kanban-card--dragging']: dragging, ['bg--light']: mode.colorMode === 'light', ['bg--dark']: mode.colorMode === 'dark' } )}>
                    <div
                      className='card-controls-box'
                      style={{
                        marginBottom: 'var(--chakra-space-2)',
                      }}
                    >
                      <div
                        className={clsx('card-title', { ['light']: mode.colorMode === 'light', ['dark']: mode.colorMode === 'dark' })}
                      >
                        <Text
                          // color={assignmentExecutorsFilters.includes(name) ? mode.colorMode === 'dark' ? 'blue.200' : 'blue.500' : 'inherit'}
                        >{card.title}</Text>
                      </div>
                      <div className='card-controls-box--right'>
                        <Tooltip label="Проскроллить в чате" aria-label='SCROLL_INTO_VIEW'>
                          <IconButton
                            size='xs'
                            aria-label="-SCROLL_INTO_VIEW"
                            colorScheme='gray'
                            variant='outline'
                            isRound
                            icon={<CgArrowsVAlt size={15} />}
                            onClick={() => {
                              const { ts } = card
                              scrollIntoView(
                                ts,
                                {
                                  fail: (ts) => {
                                    toast({
                                      position: 'bottom',
                                      title: `Сообщения ${ts} нет в отфильтрованных`,
                                      description: 'Либо сделать догрузку списка, либо сбросить фильтры',
                                      status: 'warning',
                                      duration: 5000,
                                    })
                                  },
                                  success: (ts) => {
                                    toast({
                                      position: 'bottom',
                                      title: `Msg ${ts} In viewport`,
                                      status: 'success',
                                      duration: 3000,
                                    })
                                  },
                                }
                              )
                            }}
                          >
                            SCROLL_INTO_VIEW
                          </IconButton>
                        </Tooltip>
                        {
                          card.user === name && (
                            <>
                              <Tooltip label="Редактировать" aria-label='EDIT'>
                                <IconButton
                                  size='xs'
                                  aria-label="-EDIT"
                                  colorScheme='green'
                                  variant='outline'
                                  isRound
                                  icon={<AiTwotoneEdit size={15} />}
                                  onClick={() => {
                                    const { id, title, description, ...rest } = card
                                    setEditedMessage(rest)
                                    handleEditModalOpen()
                                  }}
                                >
                                  EDIT
                                </IconButton>
                              </Tooltip>
                              <Tooltip label="Удалить из доски (снять статус)" aria-label='DEL'>
                                <IconButton
                                  size='xs'
                                  aria-label="-DEL"
                                  colorScheme='yellow'
                                  variant='outline'
                                  isRound
                                  icon={<IoMdClose size={15} />}
                                  onClick={() => handleCardRemove(card)}
                                >
                                  DEL
                                </IconButton>
                              </Tooltip>
                            </>
                          )
                        }
                      </div>
                    </div>
                    <div style={{
                      display:
                        // (assignmentSnap.isFeatureEnabled && !!card?.assignedTo && !!card?.assignedBy)
                        // || (sprintFeatureSnap.isFeatureEnabled && !!sprintFeatureSnap.commonNotifs[String(card.ts)])
                        // ? 'flex' : 'none',
                        'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginBottom: 'var(--chakra-space-2)',
                    }}>
                      {
                        assignmentSnap.isFeatureEnabled
                        ? (
                          !!card?.assignedTo && !!card?.assignedBy ? (
                            <>
                              <UserAva size={21} name={card.assignedBy} fontSize={13} onClick={() => { !!card.assignedBy && window.alert(`Assigned by ${card.assignedBy}`) }} tooltipText={`Assigned by ${card.assignedBy}`} />
                              <div style={{ marginRight: '.5rem', marginLeft: '.5rem' }}>👉</div>
                              <UserAva size={21} name={card.assignedTo[0]} mr='var(--chakra-space-2)' fontSize={13} onClick={() => { !!card.assignedTo && window.alert(`Assigned to ${card.assignedTo[0]}`) }} tooltipText={`Assigned to ${card.assignedTo[0]}`} />
                              {!!card.assignedTo && Array.isArray(card.assignedTo) && card.assignedTo.length > 0 && card.user === name && (
                                <Tooltip label={`Открепить от ${card.assignedTo[0]}`} aria-label='UNASSIGN'>
                                  <IconButton
                                    size='xs'
                                    aria-label="-UNASSIGN"
                                    colorScheme='gray'
                                    variant='outline'
                                    isRound
                                    icon={<IoMdClose size={15} />}
                                    onClick={() => {
                                      const { id, title, description, ...rest } = card
                                      // @ts-ignore
                                      const isConFirmed = window.confirm(`Вы точно хотите отвязать задачу от пользователя ${card.assignedTo[0]}?`) 
                                      // @ts-ignore
                                      if (isConFirmed) handleUnassignFromUser(rest, card.assignedTo[0])
                                    }}
                                  >
                                    UNASSIGN
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          ) : (
                            <Tooltip label='Назначить на пользователя' offset={[0, 10]} placement='right' hasArrow aria-label='ASSIGN'>
                              <Button
                                variant='outline'
                                borderRadius='full'
                                colorScheme='gray'
                                size='xs'
                                onClick={() => {
                                  resetEditedMessage()
                                  setTimeout(() => {
                                    const { id, title, description, ...rest } = card
                                    setEditedMessage(rest)
                                    handleSearchUserModalOpen()
                                  }, 200)
                                }}
                                isDisabled={card.user !== name}
                              >Assign</Button>
                            </Tooltip>
                          )
                        ) : (
                          null
                        )
                      }
                      {
                        sprintFeatureSnap.isFeatureEnabled
                        ? !!sprintFeatureSnap.commonNotifs[String(card.ts)] ? (
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                            <Countdown
                              date={sprintFeatureSnap.commonNotifs[String(card.ts)].tsTarget}
                              renderer={CountdownRenderer}
                            />
                            <Tooltip label='Удалить из спринта' aria-label='REMOVE_FROM_SPRINT'>
                              <IconButton
                                ml={2}
                                size='xs'
                                aria-label="-REMOVE_FROM_SPRINT"
                                colorScheme='red'
                                variant='outline'
                                isRound
                                icon={<IoMdClose size={15} />}
                                onClick={handleRemoveFromSprintKanbanCard(card)}
                                isDisabled={card.user !== name}
                              >
                                REMOVE_FROM_SPRINT
                              </IconButton>
                            </Tooltip>
                          </div>
                        ) : (
                          card.status !== EMessageStatus.Done
                          ? (
                            <span style={{ marginLeft: 'auto' }}>
                              <Tooltip label='Добавить в спринт' aria-label='ADD_TO_SPRINT'>
                                <IconButton
                                  size='xs'
                                  aria-label="-ADD_TO_SPRINT"
                                  colorScheme='gray'
                                  variant='ghost'
                                  isRound
                                  icon={<BsFillCalendarFill size={17} />}
                                  onClick={handleAddToSprintKanbanCard(card)}
                                  isDisabled={card.user !== name}
                                >
                                  ADD_TO_SPRINT
                                </IconButton>
                              </Tooltip>
                            </span>
                          ) : null
                        ) : null
                      }
                    </div>
                    <Text className='card-descr'>{descrStrings.length > 1 ? `${descrStrings[0]}...` : card.description}</Text>
                  </div>
                )
              }}
            >
              {kanbanState}
            </Board>
          </FixedBottomSheet>
        )
      }
    </>
  )
}
