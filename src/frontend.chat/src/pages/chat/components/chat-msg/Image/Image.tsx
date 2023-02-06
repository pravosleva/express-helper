import { Fragment, useContext, useCallback, memo, useMemo } from 'react'
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
import styles from '~/pages/chat/Chat.module.scss'
import stylesBase from '~/App.module.scss'

type TProps = {
  message: TMessage & { _next?: { ts: number, isHidden: boolean } }
  setEditedMessage: (msg: TMessage) => void
  onEditModalOpen: () => void
  onDeleteMessage: (ts: number) => void
  onAddAdditionalTsToShow: (ts: number) => void
  onOpenGallery: (src: string) => void
}

const REACT_APP_CHAT_UPLOADS_URL = process.env.REACT_APP_CHAT_UPLOADS_URL || '/chat/storage/uploads' // '/chat/storage-proxy/uploads'

export const Image = memo(({
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
  const src = useMemo(() => `${REACT_APP_CHAT_UPLOADS_URL}/${filePath || fileName}`, [filePath, fileName])
  const handleImageClick = useCallback(() => {
    onOpenGallery(src)
  }, [onOpenGallery, src])
  const handleUrlBtnClick = useCallback((_ev: any) => {
    openUrlInNewTab(src)
  }, [src])

  return (
    <Fragment key={`${user}-${ts}-${editTs || 'original'}-${status || 'no-status'}`}>
      <Box
        id={String(ts)}
        className={clsx(styles['message'], { [styles['my-message']]: isMyMessage, [styles['oponent-message']]: !isMyMessage })}
        m=".3rem 0"
      >
        <Text
          fontSize="sm"
          mb={1}
          className={styles["from"]}
        >
          <b>{user}</b>{' '}
          <span className={styles["date"]}>
            {date}
            {!!editTs && (
              // <>{' '}/{' '}<b>Edited</b>{' '}{getNormalizedDateTime(editTs)}</>
              <>{' '}<b>Edited</b></>
            )}
          </span>
        </Text>
        <div className={styles['msg-as-image--wrapper']}>
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
          <div className={clsx(stylesBase['abs-img-service-btns'], stylesBase['top-left'])}>
            {isMyMessage && (
              <button className={clsx(stylesBase['special-btn'], stylesBase['special-btn-sm'], stylesBase['dark-btn'], stylesBase['red'])}
                onClick={() => { onDeleteMessage(ts) }}
              >Del</button>
            )}
          </div>
          <div className={clsx(stylesBase['abs-img-service-btns'], stylesBase['top-right'])}>
            {isMyMessage && (
              <button className={clsx(stylesBase['special-btn'], stylesBase['special-btn-sm'], stylesBase['dark-btn'])} onClick={() => {
                handleClickCtxMenu()
                onEditModalOpen()
              }}>Edit</button>
            )}
            <button className={clsx(stylesBase['special-btn'], stylesBase['special-btn-sm'], stylesBase['yellow-btn'])} onClick={handleUrlBtnClick}>
              <span style={{ display: 'flex', alignItems: 'center' }}>Link</span>
            </button>
          </div>
          
          {!!text && (
            <div className={clsx(stylesBase['abs-img-caption'], stylesBase['truncate-overflow'])} onClick={() => { alert(text) }}>
              {text}
            </div>
          )}
        </div>
      </Box>
      {isNextOneBtnEnabled && <div className={stylesBase['centered-box']}><button className={clsx(stylesBase['special-btn'], stylesBase['special-btn-sm'], stylesBase['dark-btn'])} onClick={() => { onAddAdditionalTsToShow(_next.ts) }}>Next One</button></div>}
    </Fragment>
  )
})
