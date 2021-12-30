import React, { Fragment, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { MainContext } from '~/mainContext'
import { useSocketContext } from '~/socketContext'
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
  FormLabel,
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
  Switch,
  HStack,
  TagCloseButton,
  TagLabel,
  Tag,
  Grid,
  useToast, UseToastOptions
} from '@chakra-ui/react'
import { FiActivity, FiFilter, FiMenu } from 'react-icons/fi'
import { BiMessageDetail } from 'react-icons/bi'
import { RiSendPlaneFill, RiErrorWarningFill } from 'react-icons/ri'
import { FaCheckCircle, FaCheck, FaListUl } from 'react-icons/fa'
import { GiDeathSkull } from 'react-icons/gi'
import { HiOutlineMenuAlt2 } from 'react-icons/hi'
// @ts-ignore
import ScrollToBottom from 'react-scroll-to-bottom'
import clsx from 'clsx'
import './Chat.scss'
import { UsersContext } from '~/usersContext'
import { useTextCounter } from '~/common/hooks/useTextCounter'
import { getNormalizedDateTime, getNormalizedDateTime2, getNormalizedDateTime3 } from '~/utils/timeConverter'
import { ContextMenu, MenuItem as CtxMenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { ColorModeSwitcher } from '~/common/components/ColorModeSwitcher'
import { SetPasswordModal } from './components/SetPasswordModal'
import { MyInfoModal } from './components/MyInfoModal'
import { TasklistModal } from './components/TasklistModal/TasklistModal'
import { md } from '~/common/chakra/theme'
import { IoMdLogOut } from 'react-icons/io'
import { CgSearch, CgAssign } from 'react-icons/cg'
import { binarySearchTsIndex } from '~/utils/sort/binarySearch'
import { useInView } from 'react-intersection-observer'
import { Logic } from './MessagesLogic'
import { useForm } from '~/common/hooks/useForm'
import { SearchInModal } from './components/SearchInModal'
import { IoMdClose } from 'react-icons/io'
import { useDebounce, useLocalStorage } from 'react-use'
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
import { EmojiPickerModal } from './components/EmojiPickerModal'
import axios from 'axios'
import { openExternalLink } from '~/utils/openExternalLink'
import { CopyToClipboard } from 'react-copy-to-clipboard'
// import { FaFire } from 'react-icons/fa'
import { ImFire } from 'react-icons/im'
import { FaTelegramPlane, FaRunning } from 'react-icons/fa'
import { DatepickerModal } from '~/pages/chat/components/TasklistModal/components/DatepickerModal' // './components/DatepickerModal'
import { useSnapshot } from 'valtio'
// const assignmentSnap = useSnapshot(assignmentFeatureProxy)
import { FiArrowRight } from 'react-icons/fi'
import { CheckRoomSprintPolling } from '~/common/components/CheckRoomSprintPolling'
import { BsFillCalendarFill } from 'react-icons/bs'
import { useAddToHomescreenPrompt } from '~/common/hooks/useAddToHomescreenPrompt'

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || ''

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

// @ts-ignore
// const overwriteMerge = (destinationArray, sourceArray, _options) => [, ...sourceArray]
const tsSortDEC = (e1: TMessage, e2: TMessage) => e1.ts - e2.ts
const charsLimit = 2000

type TUser = { socketId: string; room: string; name: string }

const statusMap: {
  [key: string]: any
} = {
  [EMessageStatus.Done]: <FaCheckCircle size={15} />,
  [EMessageStatus.Dead]: <GiDeathSkull size={14} /*color='#000'*/ />,
  [EMessageStatus.Warn]: <FiActivity size={15} /*color='#000'*/ />,
  // [EMessageStatus.Danger]: <RiErrorWarningFill size={17} /*color='#000'*/ />,
  // [EMessageStatus.Danger]: <FaFire size={14} />,
  [EMessageStatus.Danger]: <ImFire size={14} />,
  [EMessageStatus.Success]: <FaCheck size={10} />,
  'assign': <CgAssign size={18}/>,
}
const getIconByStatus = (status: EMessageStatus | 'assign', isColored: boolean) => {
  switch (true) {
    case !!statusMap[status]: return <span className='abs-tail' style={{ width: '17px', backgroundColor: isColored ? getBgColorByStatus(status) : 'inherit' }}>{statusMap[status]}</span>
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
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

export const Chat = () => {
  const { name, slugifiedRoom: room, setRoom, isAdmin, tsMap, tsMapRef, sprintFeatureProxy, userInfoProxy, assignmentFeatureProxy } = useContext(MainContext)
  const sprintFeatureSnap = useSnapshot(sprintFeatureProxy)
  const userInfoSnap = useSnapshot(userInfoProxy)
  const assignmentSnap = useSnapshot(assignmentFeatureProxy)

  // @ts-ignore
  const { socket, roomData, isConnected } = useSocketContext()
  const [message, setMessage] = useState('')
  const resetMessage = () => {
    setMessage('')
  }
  const [messages, setMessages] = useState<TMessage[]>([])
  const resetMessages = useCallback(() => {
    setMessages([])
  }, [setMessages])
  const logic = useMemo<Logic>(() => {
    return new Logic(messages)
  }, [JSON.stringify(messages)])
  // @ts-ignore
  const { users, tasklist } = useContext(UsersContext)
  const history = useHistory()
  const toast = useToast()
  const [left, isMsgLimitReached] = useTextCounter({ text: message, limit: 2000 })
  const [tokenLS, _setTokenLS, removeTokenLS] = useLocalStorage<any>('chat.token')
  // const textFieldRef = useRef<HTMLInputElement>(null)
  const textFieldRef = useRef<HTMLTextAreaElement>(null)

  // window.onpopstate = e => handleLogout()
  //Checks to see if there's a user present
  // useEffect(() => {
  //     if (!isLogged) history.push('/')
  // }, [isLogged])

  const [tsPoint, setTsPoint] = useState<number | null>(Date.now())
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
          position: 'top',
          title: notif?.title,
          description: notif?.description,
          status: notif?.status || 'info',
          duration: 7000,
          isClosable: true,
        })
      }
      const myUserDataListener = (regData: any) => {
        userInfoProxy.regData = regData
      }
      const logoutFromServerListener = () => {
        history.push('/')
      }
      const updMsgListener = ({ text, ts, editTs, status, assignedTo, assignedBy }: { text: string, editTs?: number, status?: EMessageStatus, ts: number, assignedTo?: string[], assignedBy?: string }) => {
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

  const partialOldChatListener = ({ result, nextTsPoint, isDone }: { result: TMessage[], nextTsPoint: number, isDone: boolean }) => {
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
  }

  const getPieceOfChat = useCallback(() => {
    if (!!socket && !!tsPoint) {
      setIsChatLoading(true)
      setTimeout(() => {
        // NOTE: (про параметр targetRoom)
        // Пришлось подстраховаться, т.к. после смены комнаты все еще успевали приходить запрошенные сообщения
        // Для пользователя выглядело необычно =)
        socket.emit('getPartialOldChat', { tsPoint, room }, (res: any) => {
          setIsChatLoading(false)

          try {
            const { result, nextTsPoint, isDone, targetRoom } = res

            if (!!result && targetRoom === room) partialOldChatListener({ result, nextTsPoint, isDone })
          } catch (err) {
            console.log(err)
          }

        })
      }, 500)
    }
  }, [tsPoint, room, socket])

  const prevRoom = useRef<string | null>(null)

  useEffect(() => {
    // NOTE: Отписаться при смене комнаты
    if (!!socket && !!prevRoom.current) {
      socket.emit('unsetMe', { name, room: prevRoom.current })
    }
    if (!!room) prevRoom.current = room

    if (!!socket && !!name && !!room) {
      socket.emit('setMeAgain', { name, room, token: String(tokenLS) }, (err?: string) => {
        if (!!err) {
          toast({ title: err, status: 'error', duration: 5000, isClosable: true })
          history.push('/')
        }
      })

      return () => {
        socket.emit('unsetMe', { name, room })
      }
    }
  }, [socket, toast, name, room, history])

  useEffect(() => {
    console.log('EFFECT: socket?.connected', socket?.connected)
    if (!!socket && !!name && !!room) {
      if (!!socket?.connected) {
        socket.emit('setMeAgain', { name, room }, (err?: string) => {
          if (!!err) {
            console.log(err)
            toast({ title: err, status: 'error' })
            history.push('/')
          }
        })
        setFullChatReceived(false)
        setTsPoint(Date.now())
      } else {
        socket.emit('unsetMe', { name, room })
      }
    }
  }, [socket?.connected, room, history, name])

  const [filters, setFilters] = useState<EMessageStatus[]>([])
  const setFilter = (filter: EMessageStatus) => {
    setFilters([filter])
  }
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
    if (isMsgLimitReached) {
      toast({
        position: 'top',
        title: 'Sorry',
        description: 'Cant send big msg',
        status: 'error',
        duration: 7000,
        isClosable: true,
      })
      return
    }
    const normalizedMsg = message.trim().replace(/\n+/g, '\n') // message.replace(/\s+/g, ' ').trim()
    if (!!socket && !!normalizedMsg) {
      setIsSending(true)
      
      const newStuff: { message: string, userName: string, status?: EMessageStatus } = { message: normalizedMsg, userName: name }

      if (filters.length === 1 && Object.values(EMessageStatus).includes(filters[0])) newStuff.status = filters[0]

      socket.emit('sendMessage', { ...newStuff }, () => {
        setIsSending(false)
      })
      resetMessage()
    }
  }, [toast, isMsgLimitReached, socket, setIsSending, resetMessage, filters, message])
  const handleKeyUp = (ev: any) => {
    switch (true) {
      case ev.keyCode === 13 && !ev.shiftKey:
        if (!!message) handleSendMessage()
        break
      default:
        break
    }
  }
  const handleChange = (ev: any) => {
    setMessage(ev.target.value)
  }
  const hasUserInMessage = useCallback(
    (user: TUser) => {
      let result = false
      const template = `@${user.name}`

      if (message.includes(template)) result = true

      return result
    },
    [message]
  )
  const handleUserClick = (user: TUser) => {
    if (!hasUserInMessage(user)) {
      setMessage(`@${user.name}, ${message}`)
    }
    if (!!textFieldRef.current) textFieldRef.current.focus()
  }

  useEffect(() => {
    if (!room || !name) history.push('/')
  }, [])

  const { isOpen: isEditModalOpen, onOpen: handleEditModalOpen, onClose: handleEditModalClose } = useDisclosure()
  const initialEditedMessageState = { text: '', ts: 0 }
  const [editedMessage, setEditedMessage] = useState<{ text: string; ts: number; status?: EMessageStatus; file?: {fileName: string, filePath?: string }, assignedTo?: string[], assignedBy?: string }>(initialEditedMessageState)
  const [isCtxMenuOpened, setIsCtxMenuOpened] = useState<boolean>(false)
  // const resetEditedMessage = () => {
  //   setEditedMessage(initialEditedMessageState)
  // }
  const handleShowCtxMenu = () => {
    setIsCtxMenuOpened(true)
  }
  const handleHideCtxMenu = () => {
    setIsCtxMenuOpened(false)
  }
  const initialRef = useRef(null)
  const handleChangeEditedMessage = (e: any) => {
    setEditedMessage((state) => ({ ...state, text: e.target.value }))
  }
  const handleSaveEditedMessage = ({ assignedTo }: { assignedTo?: string[] }, cb?: () => void) => {
    if (!editedMessage?.text && !editedMessage.file) {
      toast({
        position: 'top',
        // title: 'Sorry',
        description: 'Should not be empty',
        status: 'error',
        duration: 3000,
      })
      return
    }
    if (editedMessage?.text.length > charsLimit) {
      toast({
        position: 'top',
        // title: 'Sorry',
        description: `Too big! ${charsLimit} chars, not more`,
        status: 'error',
        duration: 3000,
      })
      return
    }
    if (!!socket) {
      const newData: Partial<TMessage> = { text: editedMessage.text }
      if (!!editedMessage.status) newData.status = editedMessage.status
      if (!!editedMessage.assignedTo) newData.assignedTo = editedMessage.assignedTo
      if (!!assignedTo) newData.assignedTo = assignedTo
      socket.emit(
        'editMessage',
        { newData, ts: editedMessage.ts, room, name },
        (errMsg: string) => {
          if (!!errMsg) {
            toast({
              position: 'top',
              // title: 'Sorry',
              description: errMsg,
              status: 'error',
              duration: 7000,
              isClosable: true,
            })
          }
        }
      )
    }
    if (!!cb) cb()
    handleEditModalClose()
  }
  // const handleKeyDownEditedMessage = (ev: any) => {
  //   if (ev.keyCode === 13) {
  //     if (!!room) handleSaveEditedMessage()
  //   }
  // }
  const handleDeleteMessage = (ts: number) => {
    const isConfirmed = window.confirm('Вы точно хотите удалить это сообщение?')

    if (isConfirmed) {
      if (!!socket) {
        const targetTs = (!!ts && Number.isInteger(ts)) ? ts : editedMessage.ts
  
        socket.emit('deleteMessage', { ts: targetTs, room, name }, (errMsg: string) => {
          if (!!errMsg) {
            toast({
              position: 'top',
              // title: 'Sorry',
              description: errMsg,
              status: 'error',
              duration: 7000,
              isClosable: true,
            })
          }
        })
      } else {
        window.alert('Похоже, проблема с соединением')
      }
    }
  }
  const handleSetStatus = (status: EMessageStatus) => {
    if (!!socket) {
      const newData: Partial<TMessage> = { text: editedMessage.text, status }

      if (!!editedMessage.assignedTo && !!editedMessage.assignedBy && status !== EMessageStatus.Done) {
        newData.assignedTo = editedMessage.assignedTo
        newData.assignedBy = editedMessage.assignedBy
      }
      socket.emit(
        'editMessage',
        { newData, ts: editedMessage.ts, room, name }
      )
    }
  }
  const handleUnsetStatus = () => {
    if (!!socket) {
      const newData: Partial<TMessage> = { text: editedMessage.text }

      if (!!editedMessage.assignedTo && !!editedMessage.assignedBy) {
        newData.assignedTo = editedMessage.assignedTo
        newData.assignedBy = editedMessage.assignedBy
      }
      socket.emit(
        'editMessage',
        { newData, ts: editedMessage.ts, room, name }
      )
    }
  }

  // --- Set my password
  const [isSetPasswordModalOpened, setIsSetPasswordModalOpened] = useState<boolean>(false)
  const handleSetPasswordModalOpen = () => {
    setIsSetPasswordModalOpened(true)
  }
  const handleSetPasswordModalClose = () => {
    setIsSetPasswordModalOpened(false)
  }
  // ---
  // --- My info:
  const [isMyInfoModalOpened, setIsMyInfoModalOpened] = useState<boolean>(false)
  const handleMyInfoModalOpen = () => {
    setIsMyInfoModalOpened(true)
  }
  const handleMyInfoModalClose = () => {
    setIsMyInfoModalOpened(false)
  }
  // ---
  // --- Tasklist:
  const [isTasklistModalOpened, setTasklistModalOpened] = useState<boolean>(false)
  const handleTasklistModalOpen = () => {
    setTasklistModalOpened(true)
  }
  const handleTasklistModalClose = () => {
    setTasklistModalOpened(false)
  }
  // ---
  // --- Search user:
  const [isSearchUserModalOpened, setSearchUserModalOpened] = useState<boolean>(false)
  const handleSearchUserModalOpen = () => {
    if (!!editedMessage.assignedTo) {
      toast({
        position: 'top',
        title: 'Sorry',
        description: `Already assigned to ${editedMessage.assignedTo.join(', ')}`,
        status: 'warning',
        duration: 7000,
        isClosable: true,
      })
      return
    }
    setSearchUserModalOpened(true)
  }
  const handleSearchUserModalClose = () => {
    setSearchUserModalOpened(false)
  }
  // ---

  // const heighlLimitParentClass = useBreakpointValue({ md: "height-limited-md", base: "height-limited-sm" })
  const [downToSm] = useMediaQuery(`(max-width: ${md}px)`)
  const [upToSm] = useMediaQuery(`(min-width: ${md + 1}px)`)
  const completedTasksLen = useMemo(() => !!tasklist ? tasklist.filter(({ isCompleted }: any) => isCompleted).length : 0, [JSON.stringify(tasklist)])
  const percentage = useMemo(() => {
    if (tasklist.length === 0) return 0

    const all = tasklist.length
    const completed = completedTasksLen

    return Math.round(completed * 100 / all)
  }, [tasklist, completedTasksLen])

  const [inViewRef, inView, _entry] = useInView({
    /* Optional options */
    threshold: 0,
  })
  useEffect(() => {
    if (inView) getPieceOfChat()
  }, [inView, getPieceOfChat])

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
      // toast({ position: 'top', description: `Connect ${rendCounter.current}`, status: 'info', duration: 10000, isClosable: true })
    }
  }, [isConnected])

  const [additionalTsToShow, setAdditionalTsToShow] = useState<number[]>([])

  const addAdditionalTsToShow = (ts: number) => {
    setAdditionalTsToShow((arr) => [...arr, ts])
  }
  const resetAdditionalTsToShow = useCallback(() => {
    setAdditionalTsToShow([])
  }, [setAdditionalTsToShow])

  const { formData, handleInputChange, resetForm } = useForm({
    searchText: '',
  })
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [, _cancel] = useDebounce(
    () => {
      // setState('Typing stopped');
      setDebouncedSearchText(formData.searchText);
    },
    1000,
    [formData.searchText]
  );
  // useEffect(() => {
  //   if (!formData.searchText && filters.length === 0) resetAdditionalTsToShow()
  // }, [formData.searchText, filters.length, resetAdditionalTsToShow])
  useEffect(() => {
    // if (!formData.searchText)
    resetAdditionalTsToShow()
  }, [formData.searchText, filters.length, resetAdditionalTsToShow])
  // useEffect(() => {
  //   resetAdditionalTsToShow()
  // }, [filters.length, resetAdditionalTsToShow])

  const [isSearchModeEnabled, setIsSearchModeEnabled] = useState<boolean>(false)
  const handleEnableSearch = () => {
    setIsSearchModeEnabled(true)
  }
  const handleDisableSearch = () => {
    setIsSearchModeEnabled(false)
  }

  const [isDrawerMenuOpened, setIsDrawerMenuOpened] = useState<boolean>(false)
  const handleOpenDrawerMenu = () => {
    setIsDrawerMenuOpened(true)
  }
  const handleCloseDrawerMenu = useCallback(() => {
    setIsDrawerMenuOpened(false)
  }, [setIsDrawerMenuOpened])

  // -- ROOMS SAMPLE
  const [roomlistLS, setRoomlistLS] = useLocalStorage<{ name: string, ts: number }[]>('chat.roomlist', [])
  
  const updateRoomTsInLS = (roomName: string) => {
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
  }
  const handleLogout = useCallback(async () => {
    const isConfirmed = window.confirm('Вы уверенны?')
    if (!isConfirmed) return

    const jwtLogout = await axios.post(`${REACT_APP_API_URL}/chat/api/auth/logout`, {})
      .then((res: any) => res.data)
      .catch((err: any) => err)
    
    if (jwtLogout.ok) {
      toast({ position: 'top', description: jwtLogout?.message || 'Unlogged', status: 'info', duration: 3000, isClosable: true })
    }

    if (!!socket) socket.emit('logout', { name, token: String(tokenLS) })
    updateRoomTsInLS(room)

    // -- NOTE: New
    removeTokenLS()
    // --

    setTimeout(() => {
      // history.go(0)
      history.push('/')
    }, 0)
  }, [updateRoomTsInLS, socket, removeTokenLS, tokenLS])
  const handleRoomClick = useCallback((room) => {
    // console.log(room, 'CLICKED')
    updateRoomTsInLS(room)
  }, [updateRoomTsInLS])
  // --
  const filteredMessages = useMemo(() => logic.getFiltered({ filters, searchText: debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters }), [logic, filters, debouncedSearchText, additionalTsToShow, assignmentExecutorsFilters])
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
    return hasNewsInRoomlist(roomlistLS || [], tsMap, room)
  }, [roomlistLS, tsMap, room])

  const onUserAssign = (name: string) => {
    if (!!editedMessage?.assignedTo && Array.isArray(editedMessage.assignedTo) && editedMessage.assignedTo.length > 0) {
      toast({
        position: 'top',
        title: 'Sorry',
        description: 'For one user only',
        status: 'warning',
        duration: 7000,
        isClosable: true,
      })
      return
    }
    if (!!editedMessage) {
      handleSaveEditedMessage({ assignedTo: [name] }, () => {
        handleSearchUserModalClose()
        toast({
          position: 'top',
          title: 'Assigned',
          description: `to ${name}`,
          status: 'success',
          duration: 7000,
          isClosable: true,
        })
      })
    }
  } // , [editedMessage, handleSearchUserModalClose, handleSaveEditedMessage])
  const handleUnassignFromUser = (message: TMessage, unassignFromUserName: string) => {
    if (!!socket) {
      const { assignedTo, ...rest } = message
      const newData: TMessage = { ...rest }

      if (!!message.assignedTo && Array.isArray(message.assignedTo) && message.assignedTo.length > 0) {
        const newAssignedArr = message.assignedTo.filter((un) => un !== unassignFromUserName)

        if (newAssignedArr.length > 0) newData.assignedTo = newAssignedArr
      }

      socket.emit('editMessage', { newData, ts: message.ts, room, name }, (errMsg: string) => { if (!!errMsg) toast({ position: 'top', description: errMsg, status: 'error', duration: 7000, isClosable: true }) })
    }
  }

  // -- Assignment feature switcher
  const [afLS, setAfLS] = useLocalStorage<{ [key: string]: number }>('chat.assignment-feature')
  useEffect(() => {
    assignmentFeatureProxy.isFetureEnabled = afLS?.[room] === 1
  }, [afLS, room])
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
  const [isAssignmentDescrOpened, setIsAssignmentDescrOpened] = useState<boolean>(false)
  const toggleAssignmentDescr = useCallback((e) => {
    setIsAssignmentDescrOpened((s) => !s)
  }, [setIsAssignmentDescrOpened])

  const toggleAssignmentFeature = useCallback((e) => {
    setAFLSRoom(e.target.checked ? 1 : 0)
  }, [setAFLSRoom])
  // --

  const resetSearchAndFiltersAndAssignmentFilters = useCallback(() => {
    resetFilters()
    resetForm()
    handleResetAssignmentFilters()
  }, [resetFilters, resetForm, handleResetAssignmentFilters])

  const allImagesMessagesLightboxFormat = useMemo(() => logic.getAllImagesLightboxFormat(), [logic])

  const [isEmojiOpened, setIsEmojiOpened] = useState<boolean>(false)
  const handleOpenEmoji = useCallback(() => { setIsEmojiOpened(true) }, [setIsEmojiOpened])
  const handleCloseEmoji = useCallback(() => { setIsEmojiOpened(false) }, [setIsEmojiOpened])
  const handleSelectEmojies = useCallback((value: string) => {
    setMessage((s) => `${s.trim()} ${value}`)
  }, [setMessage])

  const handleOpenExternalLink = useCallback(openExternalLink, [])
  const handleSetQuickStruct = useCallback(() => {
    setMessage((s) => `┣ ${s || 'root'}
┃ ┣ a
┃ ┃ ┣ a1
┃ ┃ ┃ ┣ a1.1
┃ ┃ ┃ ┗ a1.2
┃ ┃ ┗ a2
┃ ┣ b`)
  }, [setMessage])
  const isLogged = useMemo(() => userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser, [userInfoSnap.regData?.registryLevel])

  const handleRemoveFromSprint = async (ts: number) => {
    console.log(editedMessage)
    const data = { ts, room_id: room, username: name }
    const result = await axios.post(`${REACT_APP_API_URL}/chat/api/common-notifs/remove`, {
      ...data,
    })
      .then((res) => {
        return res.data
      })
      .catch((err) => err)

    if (result.ok && result.ts) {
      if (!!sprintFeatureProxy.commonNotifs[String(result.ts)])
        delete sprintFeatureProxy.commonNotifs[String(result.ts)]
    }
  }
  const handleAddCommonNotif = async ({ ts, tsTarget, text }: any) => {
    const data = { room_id: room, ts, tsTarget, username: name, text }
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
  }
  const [isDatepickerOpened, setIsDatepickerOpened] = useState<boolean>(false)
  const handleOpenDatePicker = useCallback(() => {
    setIsDatepickerOpened(true)
  }, [setIsDatepickerOpened])
  const handleCloseDatePicker = useCallback(() => {
    setIsDatepickerOpened(false)
  }, [setIsDatepickerOpened])
  const onUpdateTargetDate = (tsTarget: number) => {
    const ts = editedMessage.ts
    const text = editedMessage.text
    handleAddCommonNotif({ ts, tsTarget, text })
  }

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
  const toggleSprintFeature = () => {
    const newVal = !sprintFeatureSnap.isFeatureEnabled
    
    updateSprintSetting4TheRoom(room, newVal)
    sprintFeatureProxy.isFeatureEnabled = newVal
  }
  useEffect(() => {
    sprintFeatureProxy.isFeatureEnabled = sprintSettingsLS?.[room]?.isEnabled || false
    sprintFeatureProxy.commonNotifs = {}
    sprintFeatureProxy.tsUpdate = Date.now()
  }, [room])
  const [isSprintDescrOpened, setIsSprintDescrOpened] = useState<boolean>(false)
  const toggleSprintDescr = () => {
    setIsSprintDescrOpened((s) => !s)
  }
  // --

  // -- PWA
  const [pwaPrompt, pwaPromptToInstall] = useAddToHomescreenPrompt()
  const [isPWAReqVisible, setIsPWAReqVisible] = React.useState(false)
  const pwaReqHide = () => { setIsPWAReqVisible(false) }
  useEffect(
    () => {
      if (pwaPrompt) setIsPWAReqVisible(true);
    },
    [pwaPrompt]
  )
  // --

  return (
    <>
      <DatepickerModal
        // key={initialUncheckedTs}
        isOpened={isDatepickerOpened}
        onClose={handleCloseDatePicker}
        onSubmit={onUpdateTargetDate}
        initialTs={Date.now()}
        // content={() => <pre>{JSON.stringify(editedTask.current, null, 2)}</pre>}
        title="Deadline"
      />
      {upToSm && (
        <EmojiPickerModal
          isOpened={isEmojiOpened}
          onClose={handleCloseEmoji}
          onSubmit={handleSelectEmojies}
        />
      )}
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
            <CtxMenuItem data={{ foo: 'bar' }} onClick={handleSearchUserModalOpen} className='assign'>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', background: 'inherit' }}>{!!getIconByStatus('assign', false) && <div style={{ marginRight: '8px' }}>{getIconByStatus('assign', false)}</div>}<div><b>Assign</b></div></div>
            </CtxMenuItem>
          )
        }
      </ContextMenu>

      <Modal
        size="sm"
        initialFocusRef={initialRef}
        finalFocusRef={textFieldRef}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit your msg</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Text</FormLabel>
              <Textarea
                isInvalid={!editedMessage?.text}
                resize="vertical"
                placeholder="Message"
                ref={initialRef}
                // onKeyDown={handleKeyDownEditedMessage}
                value={editedMessage.text}
                onChange={handleChangeEditedMessage}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              // @ts-ignore
              onClick={handleSaveEditedMessage}
            >
              Save
            </Button>
            <Button onClick={handleEditModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className='main-wrapper'>
        <Flex
          className="room"
          flexDirection="column"
          width={{ base: '100%', sm: '450px', md: '550px' }}
          height={{ base: '100%', sm: 'auto' }}
        >
          <Heading className="heading" as="h4" p={[4, 4]} borderRadius="8px 8px 0 0">
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
                  <DrawerCloseButton />
                  <DrawerHeader borderBottomWidth="1px">
                    {room}
                  </DrawerHeader>

                  <DrawerBody>
                    <Stack spacing={4} mt={2}>
                      {/* <Box><Text>The room features</Text></Box> */}
                      <Grid templateColumns='repeat(3, 1fr)' gap={2}>
                        {
                          isPWAReqVisible && (
                            <Box>
                              <Grid templateColumns='50px auto 50px' gap={2}>
                                <Button onClick={pwaReqHide}>Close</Button>
                                <Box>Это приложение можно добавить на главный экран Вашего устройства</Box>
                                <Button isFullWidth size='sm' onClick={pwaPromptToInstall}>Добавить</Button>
                              </Grid>
                            </Box>
                          )
                        }
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
                          >
                            Tools
                          </MenuButton>
                          <MenuList
                            zIndex={1001}
                            _dark={{ bg: "gray.600" }}
                            // _hover={{ bg: "gray.500", color: 'white' }}
                            // _expanded={{ bg: "gray.800" }}
                            // _focus={{ boxShadow: "outline" }}
                          >
                            <MenuItem
                              // _hover={{ bg: "gray.500", color: 'white' }}
                              // _focus={{ bg: "gray.500", color: 'white' }}
                              minH="40px"
                              key="tasklist-btn"
                              onClick={handleTasklistModalOpen}
                            >
                              <Text fontSize="md" fontWeight='bold'>Tasklist{tasklist.length > 0 ? ` ${percentage}% (${completedTasksLen} of ${tasklist.length})` : ''}</Text>
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
                            >Photos</Button>
                          )
                        }
                        <CopyToClipboard
                          text={`http://pravosleva.ru/express-helper/chat/#/?room=${room}`}
                          onCopy={() => {
                            toast({
                              position: 'top',
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
                          >Copy Link</Button>
                        </CopyToClipboard>
                      </Grid>
                      
                      <>
                        {userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser && (
                          <>
                            <Box style={{ display: 'flex', alignItems: 'center' }}>
                              <FormControl display='flex' alignItems='center'>
                                <Switch id='assignment-feature-switcher' mr={3} onChange={toggleAssignmentFeature} isChecked={isAssignmentFeatureEnabled} />
                                <FormLabel htmlFor='assignment-feature-switcher' mb='0'>
                                  Assignment feature
                                </FormLabel>
                              </FormControl>
                              <Box style={{ marginLeft: 'auto' }}>
                                <Button size='sm' variant='link' onClick={toggleAssignmentDescr} rounded='3xl'>{isAssignmentDescrOpened ? 'Close' : 'What is it?'}</Button>
                              </Box>
                            </Box>
                            {
                              isAssignmentDescrOpened && (
                                <Box>Эта фича добавит дополнительный пункт контекстного меню сообщения в чате <b>Assign</b> для назначения задачи на пользователя, если рассматривать сообщение как задачу</Box>
                              )
                            }
                          </>
                        )}
                        {userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser && (
                          <>
                            <Box style={{ display: 'flex', alignItems: 'center' }}>
                              <FormControl display='flex' alignItems='center'>
                                <Switch id='sprint-feature-switcher' mr={3} onChange={toggleSprintFeature} isChecked={sprintFeatureSnap.isFeatureEnabled} />
                                <FormLabel htmlFor='sprint-feature-switcher' mb='0'>
                                  Sprint feature
                                </FormLabel>
                              </FormControl>
                              <Box style={{ marginLeft: 'auto' }}>
                                <Button size='sm' variant='link' onClick={toggleSprintDescr} rounded='3xl'>{isSprintDescrOpened ? 'Close' : 'What is it?'}</Button>
                              </Box>
                            </Box>
                            {
                              isSprintDescrOpened && (
                                <Box>Эта фича позволит добавить задачи в спринт (они видны всем)</Box>
                              )
                            }
                          </>
                        )}
                        
                        <AccordionSettings
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
                                  onCloseMenuBar={() => {
                                    handleCloseDrawerMenu()
                                    updateRoomTsInLS(room)
                                  }}
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
                      </>
                    </Stack> 
                  </DrawerBody>

                  <DrawerFooter borderTopWidth="1px">
                    <ColorModeSwitcher
                      mr={2}
                      colorScheme="gray"
                    />
                    <Button variant="outline" mr={1} onClick={handleCloseDrawerMenu}>
                      Close
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <Menu
                autoSelect={false}
                // onOpen={resetFilters}
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
                  <SearchInModal
                    isOpened={isSearchModeEnabled}
                    text={formData.searchText}
                    onClose={handleDisableSearch}
                    onChange={handleInputChange}
                    onClear={() => {
                      resetForm()
                      handleDisableSearch()
                    }}
                  />
                  <div>
                    {
                      Object.values(EMessageStatus).map((status) => {
                        const Icon = !!getIconByStatus(status, false) ? <span style={{ marginRight: '8px', alignSelf: 'center' }}>{getIconByStatus(status, false)}</span> : null
                        const counter = logic.getCountByFilter(status)
                        const isFilterEnabled = filters.includes(status)
                        const isDisabed = counter === 0 || isFilterEnabled

                        return (
                          <MenuItem
                            minH="40px"
                            key={status}
                            onClick={() => setFilter(status)}
                            isDisabled={isDisabed}
                          >
                            <Text fontSize="md" fontWeight='bold' display='flex'>{Icon}{capitalizeFirstLetter(status)} ({counter})</Text>
                          </MenuItem>
                        )
                      })
                    }
                    <MenuItem
                      minH="40px"
                      onClick={() => setFilters([EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn])}
                      isDisabled={logic.getCountByFilters([EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn]) === 0 || filters.join(',') === [EMessageStatus.Success, EMessageStatus.Danger, EMessageStatus.Warn].join(',')}
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
                      >
                        <Text fontSize="md" fontWeight='bold' display='flex'><span style={{ width: '17px', marginRight: '8px' }}><IoMdClose size={17} /></span><span>Unset filter</span></Text>
                      </MenuItem>
                    )
                  }
                  {/*
                  <MenuItem
                      minH="40px"
                      color='red.500'
                    >
                      <Text fontSize="md" fontWeight='bold' display='flex'>
                        <span style={{ width: '17px', marginRight: '8px' }}><IoMdClose size={17} /></span><span>Close</span>
                      </Text>
                    </MenuItem> */}
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
                onClick={handleEnableSearch}
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

          <Box w='100%' h={1} m={[0, 0]}>
            {tasklist.length > 0 && <Progress value={percentage} size="xs" colorScheme="green" />}
          </Box>
          
          {downToSm && (filters.length > 0 || !!formData.searchText || assignmentExecutorsFilters.length > 0) && (
            <div
              style={{
                position: 'fixed',
                zIndex: 1000, // NOTE: Less than ctx menu: 1001
                bottom: '85px', right: '50px', // right: '50%', transform: 'translateX(50%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <HStack spacing={4}>
                <Tag
                  size='md'
                  borderRadius='full'
                  variant='solid'
                  colorScheme='blue'
                >
                  <TagLabel>Found {filteredMessages.length}</TagLabel>
                  <TagCloseButton onClick={resetSearchAndFiltersAndAssignmentFilters} />
                </Tag>
              </HStack>
            </div>
          )}

          <ScrollToBottom
            className={clsx(
              "messages",
              // "height-limited-md",
              { "height-limited-md": upToSm, "height-full-auto-sm": downToSm }
            )}
            debug={false}
            // debounce={1000}
          >
            <Flex ref={inViewRef} alignItems="center" justifyContent='center' width='100%' opacity=".35" mb={4}>
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
            {filteredMessages.map((message: TMessage & { _next?: { ts: number, isHidden: boolean } }, i, arr) => {
              const { user, text, ts, editTs, status, file, _next, assignedTo, assignedBy } = message
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
                  <Image
                    key={`${user}-${ts}-${editTs || 'original'}-${status || 'no-status'}`}
                    message={message}
                    setEditedMessage={setEditedMessage}
                    onEditModalOpen={handleEditModalOpen}
                    onDeleteMessage={handleDeleteMessage}
                    onAddAdditionalTsToShow={addAdditionalTsToShow}
                    onOpenGallery={handleOpenGallery}
                  />
                )
              }

              return (
                <Fragment key={`${user}-${ts}-${editTs || 'original'}-${status || 'no-status'}-${!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 ? assignedTo.join(',') : 'not_assigned'}`}>
                  <Box
                    id={String(ts)}
                    className={clsx('message', { 'my-message': isMyMessage, 'oponent-message': !isMyMessage })}
                    // style={transform}
                    mt={1}
                    mb={2}
                  >
                    <Text
                      fontSize="sm"
                      // opacity=".8"
                      mb={1}
                      className={clsx("from", { 'is-hidden': /* (isMyMessage && ((!!formData.searchText || filters.length > 0) ? false : !isLast)) */ false })}
                      // textAlign={isMyMessage ? 'right' : 'left'}
                    >
                      <b>{user}</b>{' '}
                      <span className="date">
                        {date}
                        {!!editDate && <b>{' '}Edited</b>}
                      </span>
                    </Text>
                    <div
                      style={{
                        display: 'flex',
                        // position: 'relative'
                      }}
                      className='opponent-ava-wrapper'
                    >
                      {!isMyMessage && <UserAva size={30} name={user} mr='.5rem' />}
                      <div className={clsx("msg", { [status]: !!status, 'edited-message': isCtxMenuOpened && ts === editedMessage.ts })}>
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
                              onContextMenu={(e) => {
                                // e.preventDefault()
                                handleClickCtxMenu()
                              }}
                              onClick={(e) => {
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
                          <Text display="inline-block" fontSize="md" className={clsx({ [status]: !!status })}
                            // p=".3rem .9rem"
                          >
                            {text}
                          </Text>
                        )}
                        {getIconByStatus(status, true)}
                      </div>
                    </div>
                  </Box>
                  {assignmentSnap.isFetureEnabled && !!assignedTo && assignedTo.length > 0 && (
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
                    userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser
                    && sprintFeatureSnap.isFeatureEnabled
                    && !file && !!status && status !== EMessageStatus.Done && (
                      <Flex justifyContent='flex-end' alignItems='center' style={{ width: '100%' }} mb={2}>{
                        !sprintFeatureSnap.commonNotifs[String(ts)] ? (
                          <Button
                            isDisabled={sprintFeatureSnap.inProgress.includes(ts) || !sprintFeatureSnap.isPollingWorks}
                            size='xs'
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
                            size='xs'
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
                      }</Flex>
                    )
                  }
                  {isNextOneBtnEnabled && (
                    <Box className='centered-box'>
                      <button
                        className='special-btn special-btn-sm dark-btn'
                        onClick={() => { addAdditionalTsToShow(_next.ts) }}
                      >
                        Next One
                      </button>
                    </Box>
                  )}
                </Fragment>
              )
            })}
            <div className='service-flex-row'>
              {!!uploadErrorMsg && (
                <>
                  <div><button className='special-btn special-btn-md dark-btn green' onClick={resetUploadErrorMsg}><span style={{ display: 'flex', alignItems: 'center' }}>Got it<span style={{ marginLeft: '7px' }}><FaCheck size={13} color='var(--chakra-colors-green-300)' /></span></span></button></div>
                  <div style={{ color: 'var(--chakra-colors-red-400)' }}>Upload Error: {uploadErrorMsg}</div>
                </>
              )}
              {assignmentExecutorsFilters.length === 0 && filters.length === 0 && !formData.searchText && userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser && !uploadErrorMsg && (
                <>
                  <UploadInput id='siofu_input' label='Add file' isDisabled={isFileUploading} />
                  {isFileUploading && (
                    <div>Uploading: {uploadPercentageRef.current} %</div>
                  )}
                </>
              )}
              {
                upToSm && isLogged && (
                  <div><button className='special-btn special-btn-md dark-btn' onClick={handleOpenEmoji}>Emoji</button></div>
                )
              }
              { isLogged && (
                <div><button
                  className='special-btn special-btn-md dark-btn'
                  style={{ display: 'flex', alignItems: 'center' }}
                  onClick={handleSetQuickStruct}><span style={{ marginRight: '7px' }}>┣</span><span>Struct</span></button></div>
              )}
              { isLogged && !!message && (
                <div><button className='special-btn special-btn-md dark-btn' onClick={() => { setMessage('') }}>Clear</button></div>
              )}
            </div>
          </ScrollToBottom>
          {
            isLogged ? (
              <div className="form">
                {/* <input ref={textFieldRef} type="text" placeholder='Enter Message' value={message} onChange={handleChange} onKeyDown={handleKeyDown} /> */}
                <Textarea
                  id="msg"
                  isInvalid={isMsgLimitReached}
                  resize="none"
                  ref={textFieldRef}
                  placeholder="Enter Message"
                  value={message}
                  onChange={handleChange}
                  onKeyUp={handleKeyUp}
                  variant='unstyled'
                  pl={4}
                  fontWeight='md'
                />
                <label htmlFor="msg" className='absolute-label'>{left} left</label>
                <IconButton
                  aria-label="Send"
                  // colorScheme={isMsgLimitReached ? 'red' : 'gray'}
                  isRound
                  icon={<RiSendPlaneFill size={15} />}
                  onClick={handleSendMessage}
                  disabled={!message}
                  isLoading={isSending}
                >
                  Send
                </IconButton>
              </div>
            ) : (
              <Flex
                style={{ height: '80px' }}
                justifyContent='center'
                alignItems='center'
                // bgColor='gray.600'
              >
                <Button rightIcon={<FaTelegramPlane size={18} />} size='lg' style={{ borderRadius: 'var(--chakra-radii-full)' }} colorScheme='blue' variant='solid' onClick={handleOpenExternalLink(`https://t.me/pravosleva_bot?start=invite-chat_${room}`)}>Зайти в чат через бота</Button>
              </Flex>
            )
          }
        </Flex>
      </div>
      {/* <PollingComponent promise={handleCheckPOST} resValidator={(_data: any) => false} onSuccess={() => {}} onFail={console.log} /> */}
      <CheckRoomSprintPolling />
    </>
  )
}
