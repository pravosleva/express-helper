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
  Box,
} from '@chakra-ui/react'
// import { useSocketContext } from '~/socketContext'
// import { useMainContext } from '~/mainContext'
import { useDebounce, useLocalStorage } from 'react-use'

type TProps = {
  isOpened: boolean
  onClose: () => void
  data: any
}

export const MyInfoModal = ({ isOpened, onClose, data }: TProps) => {
  const [tokenLS, _setTokenLS, removeTokenLS] = useLocalStorage<any>('chat.token')

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
          <h2>Info</h2>
          <Box mb={4}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data || {}, null, 2)}</pre>
          </Box>
          <h2>Token</h2>
          <Box>
            <code>{tokenLS}</code>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button rounded='2xl' size='sm' onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}