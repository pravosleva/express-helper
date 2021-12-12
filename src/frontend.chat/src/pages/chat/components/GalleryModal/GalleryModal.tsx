import React, { useRef, useMemo, useEffect, useCallback } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  // FormControl,
  // Input,
  // FormLabel,
  // useToast,
  // Table,
  // TableCaption,
  // Tbody,
  // Text,
  // Box,
} from '@chakra-ui/react'
import {
  TImageLightboxFormat, TMessage,
} from '~/utils/interfaces'
import SimpleReactLightbox, { SRLWrapper } from 'simple-react-lightbox'
import './GalleryModal.scss'
import slugify from 'slugify'
import clsx from 'clsx'
// import { Logic } from './MessagesLogic'
import { Logic } from '~/pages/chat/MessagesLogic'
import Img from '@lxsmnsyc/react-image'
import { Loader } from '~/common/components/Loader'

type TProps = {
  isOpened: boolean
  onClose: () => void
  defaultSrc: string | null
  messages: TMessage[]
}

export const GalleryModal = ({
  isOpened,
  onClose,
  defaultSrc,
  messages,
}: TProps) => {
  const logic = useMemo<Logic>(() => new Logic(messages), [messages])
  const allImagesMessagesLightboxFormat = useMemo(() => logic.getAllImagesLightboxFormat(), [logic])
  // const containerRef = useRef(null)
  const activeItemRef = useRef<undefined | HTMLAnchorElement>(undefined)
  useEffect(() => {
    const scrollToImg = () => {
      if (!!activeItemRef.current && isOpened) activeItemRef.current.scrollIntoView({ block: 'end', /* ibehavior: 'smooth', nline: 'center', */ })
    }
    // const clickImg = () => { if (!!activeItemRef.current) activeItemRef.current.click() }
    // setTimeout(clickImg, 50)
    setTimeout(scrollToImg, 100)
  }, [defaultSrc, isOpened])
  // useEffect(() => {
  //   const disableLinkClick = (ev: any) => {
  //     if (isOpened) {
  //       switch (ev.target.tagName) {
  //         case 'A':
  //         case 'IMG':
  //           console.log('CLICKED', ev.target.tagName)
  //           console.log(typeof ev.preventDefault);
  //           ev.preventDefault();
  //           ev.stopPropagation();
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   }
  //   document.addEventListener('click', disableLinkClick)
    
  //   return () => {
  //     document.removeEventListener('click', disableLinkClick)
  //   }
  // }, [isOpened])
  const handleTextClick = useCallback((text: string) => {
    window.alert(text)
  }, [])

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Gallery</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          // pb={1} pl={1} pr={1}
        >
          
          <SimpleReactLightbox>
            <div className='srLWrapperLayout bigFirst'>
              <SRLWrapper
                options={{
                  settings: {
                    // overlayColor: "rgb(25, 136, 124)",
                  },
                  caption: {
                    captionAlignment: 'start',
                    captionColor: '#FFFFFF',
                    captionContainerPadding: '20px 0 30px 0',
                    captionFontFamily: 'inherit',
                    captionFontSize: 'inherit',
                    captionFontStyle: 'inherit',
                    captionFontWeight: 'inherit',
                    captionTextTransform: 'inherit',
                    showCaption: true
                  },
                  buttons: {
                    showDownloadButton: false,
                    showAutoplayButton: false,
                    // backgroundColor: 'rgba(30,30,36,0.8)',
                    // backgroundColor: 'rgb(25, 136, 124)',
                    // backgroundColor: '#22577a',
                    backgroundColor: '#f44336',
                    iconColor: 'rgba(255, 255, 255, 1)',
                    iconPadding: '10px',
                  },
                  thumbnails: {
                    showThumbnails: true,
                    thumbnailsAlignment: 'center',
                    thumbnailsContainerBackgroundColor: 'transparent',
                    thumbnailsContainerPadding: '0',
                    thumbnailsGap: '0 1px',
                    thumbnailsIconColor: '#ffffff',
                    thumbnailsOpacity: 0.4,
                    thumbnailsPosition: 'bottom',
                    thumbnailsSize: ['100px', '80px']
                  },
                  progressBar:{
                    backgroundColor: '#f2f2f2',
                    fillColor: '#000000',
                    height: '3px',
                    showProgressBar: true,
                  },
                  // translations: {}, // PRO ONLY
                  // icons: {} // PRO ONLY
                }}
              >
                {
                  allImagesMessagesLightboxFormat.map(({ src, alt }: TImageLightboxFormat) => {
                    // const { large, medium, thumbnail, small } = photoData
                    // const src = !!large ? `${apiUrl}${large.url}` : medium ? `${apiUrl}${medium.url}` : !!small ? `${apiUrl}${small.url}` : `${apiUrl}${thumbnail.url}`
                    // const thumbnailSrc = !!thumbnail ? `${apiUrl}${thumbnail.url}` : src
                    const isActive = src === defaultSrc 

                    return (
                      <div
                        className={clsx('grid-item', { ['active-grid-item']: isActive })}
                        key={`${src}_${slugify(alt || 'no-comment')}`}
                      >
                        <a
                          href={src}
                          className={clsx({ 'active': isActive })}
                        >
                          {/* <img src={src} alt={alt} /> */}
                          <Img
                            // @ts-ignore
                            ref={isActive ? activeItemRef : undefined}
                            src={src}
                            alt={alt || ''}
                            loading='lazy'
                            fallback={<Loader />}
                            // @ts-ignore
                            // containerRef={containerRef}
                            // sources={[
                            //   { source: 'portrait.jpg', media: '(orientation: portrait)' },
                            //   { source: 'landscape.jpg', media: '(orientation: landscape)' },
                            // ]}
                          />
                        </a>
                        {!!alt && <div className='caption truncate-overflow-single-line' onClick={() => { handleTextClick(alt) }}>{alt}</div>}
                      </div>
                    )
                  })
                }
              </SRLWrapper>
            </div>
          </SimpleReactLightbox>
          
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          <Button onClick={onClose} variant='ghost' color='red.500'>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}