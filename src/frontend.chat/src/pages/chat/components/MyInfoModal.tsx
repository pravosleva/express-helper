import React from 'react'
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
// import { useSocketContext } from '~/socketContext'
// import { useMainContext } from '~/mainContext'

type TProps = {
  isOpened: boolean
  onClose: () => void
  data: any
}

export const MyInfoModal = ({ isOpened, onClose, data }: TProps) => {

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent rounded='2xl'>
        <ModalHeader>My info</ModalHeader>
        <ModalCloseButton rounded='3xl' />
        <ModalBody pb={6}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data || {}, null, 2)}</pre>
        </ModalBody>
        <ModalFooter>
          <Button rounded='2xl' size='sm' onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}