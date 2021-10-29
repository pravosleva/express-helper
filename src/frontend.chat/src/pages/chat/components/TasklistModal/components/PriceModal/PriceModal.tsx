import { useRef, useState } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
// import { IoMdClose } from 'react-icons/io'

type TProps = {
  isOpened: boolean
  onClose: () => void
  onSubmit: (price: number) => void
  initialPrice: number
}

export const PriceModal = ({ isOpened, onClose, onSubmit, initialPrice }: TProps) => {
  const inputRef = useRef(null)
  const [price, setPrice] = useState<number>(initialPrice)
  const handleInputChange = (e: any) => {
    try {
      setPrice(Number(e.target.value))
    } catch (_err) {} 
  }
  // const handleCancel = () => {
  //   setPrice(0)
  //   onClose()
  // }

  return (
    <Modal
      size="xs"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
      initialFocusRef={inputRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Price</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <NumberInput defaultValue={!!price ? price : ''}>
            <NumberInputField value={price} ref={inputRef} onChange={handleInputChange} />
          </NumberInput>
          {/* <Input ref={inputRef} placeholder="Search" size='md' value={text} name='searchText' onChange={onChange} /> */}
        </ModalBody>
        <ModalFooter
        className='modal-footer-btns-wrapper'
      >
        {/* !!price && <Button onClick={handleCancel} leftIcon={<IoMdClose />} variant='ghost' color='red.500'>Cancel</Button> */}
        {!!price && <Button onClick={() => {
          onSubmit(price)
        }} colorScheme="blue">Submit</Button>}
        <Button onClick={onClose} variant='ghost'>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}