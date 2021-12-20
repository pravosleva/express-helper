import React, { useRef, useState, useCallback, memo } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react'
// import { IoMdClose } from 'react-icons/io'
import Picker, { SKIN_TONE_MEDIUM_DARK, SKIN_TONE_NEUTRAL } from 'emoji-picker-react'

type TProps = {
  isOpened: boolean
  onClose: () => void
  onSubmit: (value: string) => void
}

export const EmojiPickerModal0 = ({ onSubmit, isOpened, onClose }: TProps) => {
  const searchFieldRef = useRef(null)
  const handleEmojiClick = useCallback((_event: any, emojiObject: any) => {
    if (!!emojiObject.emoji) onSubmit(emojiObject.emoji)
  }, [onSubmit])

  return (
    <Modal
      size="xs"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
      initialFocusRef={searchFieldRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Emoji</ModalHeader>
        <ModalCloseButton />
        <ModalBody pl={1} pr={1} ml='auto' mr='auto'>
          <Picker
            onEmojiClick={handleEmojiClick}
            disableAutoFocus={true}
            groupVisibility={{
              food_drink: false,
              travel_places: false,
            }}
            skinTone={SKIN_TONE_NEUTRAL}
            // groupNames={{ smileys_people: 'SYMBOLS' }}
            native
          />
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          {/* !!selectedEmoji && <Button onClick={handleClear} leftIcon={<IoMdClose />} variant='ghost' color='red.500'>Cancel</Button> */}
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const areEqual = (p1: any, p2: any) => p1.isOpened === p2.isOpened

export const EmojiPickerModal = memo(EmojiPickerModal0, areEqual)