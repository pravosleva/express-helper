import React, { useRef, useState, useCallback, useMemo } from 'react'
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
  Input,
} from '@chakra-ui/react'
// import { IoMdClose } from 'react-icons/io'

type TProps = {
  isOpened: boolean
  onClose: () => void
  onSubmit: (ts: number) => void
  initialUncheckedTs: number
  content?: () => React.ReactElement
}

export const DatepickerModal = ({ isOpened, onClose, onSubmit, initialUncheckedTs, content }: TProps) => {
  const inputRef = useRef<any>(null)
  const [uncheckedTs, setUncheckedTs] = useState<number>(initialUncheckedTs)
  const modifiedValue = useMemo(() => {
    const date = new Date(initialUncheckedTs)

    return date.toISOString().substr(0, 10);
  }, [initialUncheckedTs])
  const handleInputChange = useCallback((e: any) => {
    // console.log(e.target.value) // 2021-12-16

    const ts = new Date(e.target.value).getTime()

    setUncheckedTs(ts)

    // if (!!inputRef.current) inputRef.current.blur()
    onSubmit(ts)
    onClose()
  }, [setUncheckedTs, onSubmit, onClose])

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
        <ModalHeader>First Date</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <input
            key={uncheckedTs}
            style={{
              width: '100%',
              height: 'var(--chakra-sizes-10)',
              // lineHeight: '30px',
              paddingInlineStart: 'var(--chakra-space-4)',
              paddingInlineEnd: 'var(--number-input-input-padding)',
              borderRadius: 'var(--chakra-radii-md)',
              fontSize: 'var(--chakra-fontSizes-md)',
              background: 'inherit',
              border: '1px solid currentcolor',
            }}
            ref={inputRef}
            onChange={handleInputChange}
            className='chakra-numberinput__field'
            type='date'
            value={modifiedValue}
          />
          {!!content && content()}
        </ModalBody>
        <ModalFooter
        className='modal-footer-btns-wrapper'
      >
        {/* !!price && <Button onClick={handleCancel} leftIcon={<IoMdClose />} variant='ghost' color='red.500'>Cancel</Button> */}
        {/* !!uncheckedTs && <Button onClick={handleSuccess} colorScheme="blue">Submit</Button> */}
        <Button onClick={onClose} variant='ghost'>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}