// @ts-ignore
import React, { useState, useEffect } from 'react'
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
  FormLabel,
  useToast,
  Table,
  TableCaption,
  Tbody,
  Text,
  Box,
} from '@chakra-ui/react'
import { useSocketContext } from '~/socketContext'
import { useForm } from '~/common/hooks/useForm'
import './SearchUserModal.scss'
import { IoMdClose } from 'react-icons/io'
import { TableItem } from './TableItem'
import { useDebounce } from 'react-use'
import { getNormalizedString } from '~/utils/strings-ops'

type TProps = {
  isOpened: boolean
  onClose: () => void
  onSelectItem: (value: string) => void
}

export const SearchUserModal = ({
  isOpened,
  onClose,
  onSelectItem,
}: TProps) => {
  const { socket } = useSocketContext()
  const { formData, handleInputChange, resetForm } = useForm({
    userName: '',
  })
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [, _cancel] = useDebounce(
    () => {
      setDebouncedSearchText(formData.userName);
    },
    1000,
    [formData.userName]
  );
  const [users, setUsers] = useState<any>([])
  const toast = useToast()

  useEffect(() => {
    const normalizedText = getNormalizedString(debouncedSearchText)
    if (!!debouncedSearchText) {
      socket?.emit('users.search', { searchText: normalizedText }, (data: { users: string[], isErrored?: boolean, message?: string }) => {
        if (data.isErrored) {
          toast({
            position: 'bottom',
            title: 'Oops...',
            description: data.message || 'ERR #1',
            status: 'error',
            duration: 7000,
            isClosable: true,
          })
          return
        }
        if (!!data.users && Array.isArray(data.users) && data.users.every((elm: string) => typeof elm === 'string')) {
          setUsers(data.users)
        }
      })
    } else {
      setUsers([])
    }
  }, [debouncedSearchText])

  return (
    <Modal
      size="xs"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Box pl={0} pr={0} pb={0}>
            <FormControl>
              <FormLabel>Search by username</FormLabel>
              <Input
                autoFocus
                name='userName'
                isInvalid={!formData.userName}
                type='text'
                placeholder="Username"
                // ref={initialSetPasswdRef}
                // onKeyDown={handleKeyDownEditedMessage}
                value={formData.userName}
                onChange={handleInputChange}
              />
            </FormControl>
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={1} pl={1} pr={1}>
          <Table variant="simple" size='md'>
            <TableCaption mt={5} mb={5} textAlign='left'>В этом поиске участвуют пользователи, указавшие пароль для своего ника:<br />Боковое меню &gt; Features &gt; Set my password</TableCaption>
            <Tbody>
              {users.map((name: string) => {
                return (
                  <TableItem
                    key={name}
                    userName={name}
                    onSelectButtonClick={onSelectItem}
                    selectButtonText='Assign'
                  />
                )
              })}

            </Tbody>
          </Table>
          {/* <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(users || {}, null, 2)}</pre> */}
        </ModalBody>
        <ModalFooter
          className='modal-footer-btns-wrapper'
        >
          {!!formData.userName && <Button onClick={resetForm} leftIcon={<IoMdClose />} variant='ghost' color='red.500'>Cancel</Button>}
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
