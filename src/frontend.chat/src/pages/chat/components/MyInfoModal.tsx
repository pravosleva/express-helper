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
  Heading,
} from '@chakra-ui/react'
// import { useSocketContext } from '~/socketContext'
// import { useMainContext } from '~/mainContext'
// import { useDebounce, useLocalStorage } from 'react-use'
import { useSocketContext } from '~/context/socketContext'

type TProps = {
  isOpened: boolean
  onClose: () => void
  data: any
}

export const MyInfoModal = ({ isOpened, onClose, data }: TProps) => {
  // const [tokenLS, _setTokenLS, removeTokenLS] = useLocalStorage<any>('chat.token')
  const { socket } = useSocketContext()

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent rounded='2xl'>
        <ModalHeader>My info</ModalHeader>
        <ModalCloseButton rounded='3xl' />
        <ModalBody pb={6}>
          <Heading>Info</Heading>
          <Box mb={4}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data || {}, null, 2)}</pre>
          </Box>
          {!!socket?.id && (
            <>
              <Heading>socket.id</Heading>
              <Box>
                <code>{socket.id}</code>
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button rounded='2xl' size='sm' onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}