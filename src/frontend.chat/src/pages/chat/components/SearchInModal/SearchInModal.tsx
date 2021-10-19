import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  Input,
} from '@chakra-ui/react'
import { IoMdClose } from 'react-icons/io'

type TProps = {
  isOpened: boolean
  onClose: () => void
  text: string
  onChange: (e: any) => void
  onClear: () => void
}

export const SearchInModal = ({ text, onChange, isOpened, onClose, onClear }: TProps) => {
  const handkeKeyUp = (ev: any) => {
    if (ev.keyCode === 13) {
      if (!!text) onClose()
    }
  }

  return (
    <Modal
      size="sm"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Search</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Input placeholder="Search" size='md' value={text} name='searchText' onChange={onChange} onKeyUp={handkeKeyUp} />
        </ModalBody>
        <ModalFooter
        className='modal-footer-btns-wrapper'
      >
        {!!text && <Button onClick={onClear} leftIcon={<IoMdClose />} variant='ghost' color='red.500'>Cancel</Button>}
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}