import React, { Fragment } from 'react'
import {
  Box,
  Flex,
  IconButton,
  Text,
  Button,
  useToast, ButtonGroup,
  // color
} from '@chakra-ui/react'
import { ContextMenuTrigger } from 'react-contextmenu'
import { UserAva } from '~/pages/chat/components/UserAva'
import { getNormalizedDateTime } from '~/utils/timeConverter'
import clsx from 'clsx'
import styles from '~/pages/chat/Chat.module.scss'
import stylesBase from '~/App.module.scss'
import { EMessageStatus, TMessage, ERegistryLevel } from '~/utils/interfaces'
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
import { ImFire } from 'react-icons/im'
import { CgSearch, CgAssign } from 'react-icons/cg'
import { AssignedBox } from '~/pages/chat/components/AssignedBox'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  // FaRegSmile,
  // FaPlus,
  FaCopy,
} from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { FiArrowRight } from 'react-icons/fi'
import { BsFillCalendarFill } from 'react-icons/bs'
import appStyles from '~/App.module.scss'

// const capitalizeFirstLetter = (str: string, limit?: number): string => {
//   const res = str.charAt(0).toUpperCase() + str.slice(1)

//   if (!!limit && res.length > limit) return `${res.substring(0, limit)}...`

//   return res
// }

const bgColorsMap: { [key: string]: string } = {
  [EMessageStatus.Done]: 'var(--chakra-colors-gray-500)',
  [EMessageStatus.Dead]: 'var(--chakra-colors-gray-800)',
  [EMessageStatus.Warn]: '#FFDE68',
  [EMessageStatus.Danger]: '#FF9177',
  [EMessageStatus.Info]: '#408EEA',
  [EMessageStatus.Success]: '#31eab7',
  'assign': '#FF9177',
}
const getBgColorByStatus = (s: EMessageStatus | 'assign') => {
  switch (true) {
    case !!bgColorsMap[s]: return bgColorsMap[s]
    default: return 'current'
  }
}
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
    case !!statusMap[status]: return <span className={styles['abs-tail']} style={{ width: '17px', backgroundColor: isColored ? getBgColorByStatus(status) : 'inherit' }}>{statusMap[status]}</span>
    default: return null
  }
}

type TOtherMessageProps = {
  message: TMessage & { _next?: { ts: number, isHidden: boolean } };
  isCtxMenuOpened: boolean;
  editedMessageTs: number | null;
  handleClickCtxMenu: () => void;
  assignmentSnapIsFeatureEnabled: boolean;
  handleUnassignFromUser: (message: TMessage, userName: string) => void;
  goToExternalLink: (link: string) => void;
  handleDeleteLink: (link: string, ts: number) => void;
  needAssignmentBtns: boolean;
  hasSprintFeatureSnapCommonNotifs: boolean;
  isSprintFeatureSnapPollingWorks: boolean;
  isSprintFeatureSnapInProgressIncludesTs: boolean;
  setEditedMessage: any;
  handleOpenDatePicker: any;
  handleRemoveFromSprint: (ts: number) => void;
  isNextOneBtnEnabled: boolean;
  addAdditionalTsToShow: (ts?: number) => void;
  name: string;
}

export const MemoizedOtherMessage = React.memo(({
  message,
  isCtxMenuOpened,
  editedMessageTs,
  handleClickCtxMenu,
  assignmentSnapIsFeatureEnabled,
  handleUnassignFromUser,
  goToExternalLink,
  handleDeleteLink,
  needAssignmentBtns,
  hasSprintFeatureSnapCommonNotifs, // sprintFeatureSnap.commonNotifs[String(ts)]
  isSprintFeatureSnapPollingWorks, // sprintFeatureSnap.isPollingWorks
  isSprintFeatureSnapInProgressIncludesTs, // sprintFeatureSnap.inProgress.includes(ts)
  setEditedMessage,
  handleOpenDatePicker,
  handleRemoveFromSprint,
  isNextOneBtnEnabled,
  addAdditionalTsToShow,
  name,
}: TOtherMessageProps) => {
  const toast = useToast()
  const { user, text, ts, editTs, status, file, _next, assignedTo, assignedBy, links = [] } = message
  const isMyMessage = user === name
  const date = getNormalizedDateTime(ts)
  const editDate = !!editTs ? getNormalizedDateTime(editTs) : null
  const hasLinks = !!links && Array.isArray(links) && links.length > 0
  let contextTriggerRef: any = null;
  const toggleMenu = (e: any) => {
    // @ts-ignore
      if(!!contextTriggerRef) contextTriggerRef.handleContextClick(e);
  }

  // useEffect(() => {
  //   console.log(`-- RENDER ${message.ts}`)
  // }, [])

  return (
    <Fragment>
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
          <div className={clsx(styles["msg"], { [styles['edited-message']]: isCtxMenuOpened && ts === editedMessageTs }, !!status ? styles[status] : undefined)}>
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
                  // className='truncate-overflow'
                  style={{
                    // wordBreak: 'break-all',
                    overflowWrap: 'break-word',
                  }}
                >
                  {text}
                  {/* <div className='abs-edit-btn'><RiEdit2Fill /></div> */}
                </Text>
              </ContextMenuTrigger>
            ) : (
              <Text display="inline-block" fontSize="md" className={clsx(!!status ? [styles[status]] : undefined)}
                // p=".3rem .9rem"
                style={{
                  // wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                }}
              >
                {text}
              </Text>
            )}
            {!!status && getIconByStatus(status, true)}
          </div>
        </div>
      </Box>
      {assignmentSnapIsFeatureEnabled && !!assignedTo && assignedTo.length > 0 && (
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
                style={{
                  maxWidth: '100%',
                }}
              >
                <CopyToClipboard
                  text={link}
                  onCopy={() => {
                    toast({
                      position: 'top',
                      title: 'Link copied',
                      description: link,
                      status: 'success',
                      duration: 5000,
                      // isClosable: true,
                    })
                  }}
                  >
                  <IconButton
                    borderRadius='full'
                    aria-label='Copy link'
                    icon={<FaCopy color='inherit' size={14} />}
                    title={link}
                  />
                </CopyToClipboard>
                <Button
                  mr='-px'
                  ml='-px'
                  onClick={() => goToExternalLink(link)}
                  borderRadius='full'
                  title={descr}
                  style={{
                    // justifyContent: 'left',
                    display: 'block',
                  }}
                  className={appStyles['truncate-overflow-single-line-exp']}
                >
                  {descr}
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
                    !hasSprintFeatureSnapCommonNotifs ? (
                      <Button
                        isDisabled={isSprintFeatureSnapInProgressIncludesTs || !isSprintFeatureSnapPollingWorks}
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
                        isDisabled={isSprintFeatureSnapInProgressIncludesTs || !isSprintFeatureSnapPollingWorks}
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
                !hasSprintFeatureSnapCommonNotifs ? (
                  <Button
                    isDisabled={isSprintFeatureSnapInProgressIncludesTs || !isSprintFeatureSnapPollingWorks}
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
                    isDisabled={isSprintFeatureSnapInProgressIncludesTs || !isSprintFeatureSnapPollingWorks}
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
            onClick={() => { addAdditionalTsToShow(_next?.ts) }}
          >
            Next One
          </button>
        </Box>
      )}
    </Fragment>
  )
})
