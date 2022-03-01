import { Fragment, useContext, useCallback } from 'react'
import { TMessage } from '~/utils/interfaces'
import { getNormalizedDateTime } from '~/utils/timeConverter'
import {
  Box,
  Text,
} from '@chakra-ui/react'
import clsx from 'clsx'
// import Zoom from 'react-medium-image-zoom'
import { MainContext } from '~/context/mainContext'
// import { FcGallery } from 'react-icons/fc' // <FcGallery color='#FFF' size={17} />
import Img from '@lxsmnsyc/react-image'
import { Loader } from '~/common/components/Loader'
import { openUrlInNewTab } from '~/utils/openUrlInNewTab'

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
  const { user, text, ts, editTs, status, file, _next } = message
  const fileName = file?.fileName
  const filePath = file?.filePath
  const { name } = useContext(MainContext)
  // const isLastOfFiltered = i === arr.length -1
  const isMyMessage = user === name
  const date = getNormalizedDateTime(ts)
  const isNextOneBtnEnabled = _next?.isHidden
  const handleClickCtxMenu = () => setEditedMessage(message)
  const src = `${REACT_APP_CHAT_UPLOADS_URL}/${filePath || fileName}`
  const handleImageClick = useCallback(() => {
    onOpenGallery(src)
  }, [onOpenGallery])
  const handleUrlBtnClick = useCallback((_ev: any) => {
    openUrlInNewTab(src)
  }, [src])

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
          {/* <img alt={text} src={src} style={{ width: '100%', minWidth: 'var(--msg-img-min-with)' }} /> */}
            
          <Img
            style={{ width: '100%', minWidth: 'var(--msg-img-min-with)' }}
            src={src}
            alt={text}
            loading='lazy'
            fallback={<Loader />}
            onClick={handleImageClick}
            // @ts-ignore
            // containerRef={containerRef}
            // sources={[ { source: 'portrait.jpg', media: '(orientation: portrait)' }, { source: 'landscape.jpg', media: '(orientation: landscape)' }, ]}
          />
          <div className='abs-img-service-btns top-left'>
            {isMyMessage && (
              <button className='special-btn special-btn-sm dark-btn red'
                onClick={() => { onDeleteMessage(ts) }}
              >Del</button>
            )}
          </div>
          <div className='abs-img-service-btns top-right'>
            {isMyMessage && (
              <button className='special-btn special-btn-sm dark-btn' onClick={() => {
                handleClickCtxMenu()
                onEditModalOpen()
              }}>Edit</button>
            )}
            <button className='special-btn special-btn-sm yellow-btn' onClick={handleUrlBtnClick}>
              <span style={{ display: 'flex', alignItems: 'center' }}>Link</span>
            </button>
          </div>
          
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
