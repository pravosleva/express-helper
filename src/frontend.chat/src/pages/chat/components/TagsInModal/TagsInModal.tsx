import React, { useRef, useCallback, useState, useMemo } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Input,
  Box,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { IoMdClose } from 'react-icons/io'
import styles from './TagsInModal.module.scss'

type TProps = {
  tags: string[]
  isOpened: boolean
  onClose: () => void
  onToggeTag: (tag: string) => void
  enabledTags: string[]
}

export const TagsInModal = ({ tags, isOpened, onClose, onToggeTag, enabledTags }: TProps) => {
  // const searchFieldRef = useRef(null)
  const toggleTag = useCallback((tag: string) => (_e: any) => {
    onToggeTag(tag)
  }, [onToggeTag])
  const [search, setSearch] = useState<string>('')
  const clearSearch = useCallback(() => {
    setSearch('')
  }, [setSearch])
  const handleInputChange = useCallback((e) => {
    setSearch(e.target.value)
  } ,[])
  const memoizedTags = useMemo(() => !search ? tags : tags.filter((tag) => tag.includes(search)), [search, tags])

  return (
    <Modal
      size="xs"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
      // initialFocusRef={searchFieldRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Box pl={0} pr={0} pb={0}>
            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Input
                autoFocus={false}
                name='userName'
                // isInvalid={!formData.userName}
                type='text'
                placeholder="Search"
                // ref={initialSetPasswdRef}
                // onKeyDown={handleKeyDownEditedMessage}
                value={search}
                onChange={handleInputChange}
                // rounded='3xl'
                variant='flushed'
              />
            </FormControl>

          </Box>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          pb={6}
          className={styles['modal-tags-btns-wrapper']}
        >
          {memoizedTags.map((tag) => {
            const isEnabled = enabledTags.includes(tag)
            return (
              <Button rounded='3xl' onClick={toggleTag(tag)} colorScheme={isEnabled ? 'blue' : 'gray'}>{tag}</Button>
            )
          })}
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          {!!search && <Button onClick={clearSearch} leftIcon={<IoMdClose />} variant='ghost' color='red.500'>Clear</Button>}
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
