import React, { useRef, useMemo } from 'react'
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

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>In progress...</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={1} pl={1} pr={1}>
          
          <SimpleReactLightbox>
            <div className='srLWrapperLayout'>
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

                    return (
                      <div className='grid-item' key={`${src}_${slugify(alt || 'no-comment')}`}>
                        <a href={src} className={clsx({ 'active': src === defaultSrc })}>
                          <img src={src} alt={alt} />
                        </a>
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