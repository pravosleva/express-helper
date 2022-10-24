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
  // NumberInput,
  // NumberInputField,
  // Input,
} from '@chakra-ui/react'
// import { IoMdClose } from 'react-icons/io'

type TProps = {
  isOpened: boolean
  onClose: () => void
  onSubmit: (ts: number) => void
  initialTs: number
  content?: () => React.ReactElement
  title?: string
}

export const DatepickerModal = ({ isOpened, onClose, onSubmit, initialTs, content, title }: TProps) => {
  const inputRef = useRef<any>(null)
  const [uncheckedTs, setUncheckedTs] = useState<number>(initialTs)
  const modifiedValue = useMemo(() => {
    const date = new Date(initialTs)

    return date.toISOString().substr(0, 10);
  }, [initialTs])
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
      <ModalContent rounded='2xl'>
        <ModalHeader>{!!title ? title : 'First Date'}</ModalHeader>
        <ModalCloseButton rounded='3xl' />
        <ModalBody pb={6}>
          <input
            key={uncheckedTs}
            style={{
              width: '100%',
              height: 'var(--chakra-sizes-10)',
              // lineHeight: '30px',
              paddingInlineStart: 'var(--chakra-space-4)',
              paddingInlineEnd: 'var(--chakra-space-2)',
              // borderRadius: 'var(--chakra-radii-md)',
              borderRadius: 'var(--chakra-radii-3xl)',
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
        <Button size='sm' rounded='2xl' onClick={onClose} variant='ghost'>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}