import { Fragment, useContext } from 'react'
import { TMessage } from '~/utils/interfaces'
import { getNormalizedDateTime } from '~/utils/timeConverter'
import {
  Box,
  Text,
} from '@chakra-ui/react'
import clsx from 'clsx'
import Zoom from 'react-medium-image-zoom'
import { MainContext } from '~/mainContext'

type TProps = {
  message: TMessage & { _next?: { ts: number, isHidden: boolean } }
  setEditedMessage: (msg: TMessage) => void
  onEditModalOpen: () => void
  onDeleteMessage: (ts: number) => void
  onAddAdditionalTsToShow: (ts: number) => void
  onOpenGallery: (src: string) => void
}

const REACT_APP_CHAT_UPLOADS_URL = process.env.REACT_APP_CHAT_UPLOADS_URL || '/chat/storage/uploads' // '/chat/storage-proxy/uploads'

export const Image = ({
  message,
  setEditedMessage,
  onEditModalOpen,
  onDeleteMessage,
  onAddAdditionalTsToShow,
  onOpenGallery,
}: TProps) => {
  const { user, text, ts, editTs, status, fileName, _next } = message
  const { name } = useContext(MainContext)
  // const isLastOfFiltered = i === arr.length -1
  const isMyMessage = user === name
  const date = getNormalizedDateTime(ts)
  const isNextOneBtnEnabled = _next?.isHidden
  const handleClickCtxMenu = () => setEditedMessage(message)
  const src = `${REACT_APP_CHAT_UPLOADS_URL}/${fileName}`

  return (
    <Fragment key={`${user}-${ts}-${editTs || 'original'}-${status || 'no-status'}`}>
      <Box
        className={clsx('message', { 'my-message': isMyMessage, 'oponent-message': !isMyMessage })}
        m=".3rem 0"
      >
        <Text
          fontSize="sm"
          mb={1}
          className={clsx("from")}
        >
          <b>{user}</b>{' '}
          <span className="date">
            {date}
            {!!editTs && (
              // <>{' '}/{' '}<b>Edited</b>{' '}{getNormalizedDateTime(editTs)}</>
              <>{' '}<b>Edited</b></>
            )}
          </span>
        </Text>
        <div className='msg-as-image--wrapper'>
          <Zoom
            overlayBgColorStart='transparent'
            // overlayBgColorEnd='var(--chakra-colors-gray-700)'
            overlayBgColorEnd='rgba(0,0,0,0.85)'
          >
            <img
              alt={text}
              src={src}
              style={{ width: '100%', minWidth: '100px' }}
            />
          </Zoom>
          {isMyMessage && (
            <div className='abs-img-service-btns'>
              <button className='special-btn special-btn-sm dark-btn' onClick={() => { onDeleteMessage(ts) }}>Del</button>
              <button className='special-btn special-btn-sm dark-btn' onClick={() => {
                handleClickCtxMenu()
                onEditModalOpen()
              }}>Edit</button>
              <button className='special-btn special-btn-sm dark-btn' onClick={() => { onOpenGallery(src)} }>Open Gallery</button>
            </div>
          )}
          {!!text && (
            <div className='abs-img-caption truncate-overflow' onClick={() => { alert(text) }}>
              {text}
            </div>
          )}
        </div>
      </Box>
      {isNextOneBtnEnabled && <div className='centered-box'><button className='special-btn special-btn-sm dark-btn' onClick={() => { onAddAdditionalTsToShow(_next.ts) }}>Next One</button></div>}
    </Fragment>
  )
}