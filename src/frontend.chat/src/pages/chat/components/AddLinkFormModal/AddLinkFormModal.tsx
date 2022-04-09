import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
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
} from '@chakra-ui/react'
import { useForm } from '~/common/hooks/useForm'
// @ts-ignore
import isUrl from 'is-valid-http-url'

type TProps = {
  isOpened: boolean;
  onClose: () => void;
  onSubmit: ({ link, descr, cb }: { link: string, descr: string, cb: () => void }) => void;
}

const getSpecialDescr = (descr: string) => {
  let result = descr
  switch(true) {
    case descr.slice(0, 3).toLowerCase() === 'mr ':
      result = `⚡ ${descr.toUpperCase()}`
      break;
    case descr.slice(0, 3).toLowerCase() === 'qn ':
      result = `❓ ${descr}`
      break;
    case descr.slice(0, 3).toLowerCase() === 'wtf':
      result = `⚠️ ${descr.toUpperCase()}`
      break;
    case descr.toLowerCase() === 'done':
      result = `✅ ${descr}`
      break;
    default:
      break;
  }
  return result
}

export const AddLinkFormModal = ({
  isOpened,
  onClose,
  onSubmit,
}: TProps) => {
  const { formData, handleInputChange, resetForm } = useForm({
    link: '',
    descr: '',
  })
  const handleSubmit = () => {
    onSubmit({ link: formData.link, descr: getSpecialDescr(formData.descr), cb: () => { resetForm() } })
  }
  const isValidUrl = useMemo<boolean>(() => isUrl(formData.link), [formData.link])
  const linkRef = useRef(null)

  return (
    <Modal
      size="xs"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
      initialFocusRef={linkRef}
    >
      <ModalOverlay />
      <ModalContent rounded='3xl'>
        <ModalHeader>Add link</ModalHeader>
        <ModalCloseButton rounded='3xl' />
        <ModalBody ml='auto' mr='auto'>
          <Input rounded='3xl' ref={linkRef} mb={2} placeholder="Link" size='md' value={formData.link} name='link' onChange={handleInputChange} />
          <Input rounded='3xl' placeholder="Description" size='md' value={formData.descr} name='descr' onChange={handleInputChange} />
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          {
            !!formData.link && isValidUrl && !!formData.descr && <Button onClick={handleSubmit} size='sm' rounded='2xl' variant='ghost' color='green.500'>Save</Button>
          }
        <Button size='sm' rounded='2xl' onClick={onClose}>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}