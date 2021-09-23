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
      <ModalContent>
        <ModalHeader>My info</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data || {}, null, 2)}</pre>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}