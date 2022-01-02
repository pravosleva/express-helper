// @ts-ignore
import React, { useState, useEffect, useMemo } from 'react'
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
import { useSocketContext } from '~/context/socketContext'
import { useForm } from '~/common/hooks/useForm'
import './SearchUserModal.scss'
import { IoMdClose } from 'react-icons/io'
import { TableItem } from './TableItem'
import { useDebounce } from 'react-use'
import { getNormalizedString } from '~/utils/strings-ops'
import { useSnapshot } from 'valtio'
import { useMainContext } from '~/context/mainContext'
import { ERegistryLevel } from '~/utils/interfaces'

type TProps = {
  isOpened: boolean
  onClose: () => void
  onSelectItem: (value: string) => void
  selectItemButtonText: string
  isDisabledItem?: (text: string) => boolean
}

export const SearchUserModal = ({
  isOpened,
  onClose,
  onSelectItem,
  selectItemButtonText,
  isDisabledItem,
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

  const { userInfoProxy } = useMainContext()
  const userInfoSnap = useSnapshot(userInfoProxy)
  const isLogged = useMemo<boolean>(() => userInfoSnap.regData?.registryLevel === ERegistryLevel.TGUser, [userInfoSnap.regData?.registryLevel])

  return (
    <Modal
      size="xs"
      isOpen={isOpened}
      onClose={onClose}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent rounded='2xl'>
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
                rounded='3xl'
              />
            </FormControl>
          </Box>
        </ModalHeader>
        <ModalCloseButton rounded='3xl' />
        <ModalBody pb={1} pl={1} pr={1}>
          <Table variant="simple" size='md'>
            {!isLogged && <TableCaption mt={5} mb={5} textAlign='left'>В этом поиске участвуют пользователи (за некоторым исключением), указавшие пароль для своего ника:<br />Боковое меню &gt; Tools &gt; Set my password</TableCaption>}
            <Tbody>
              {users.map((name: string) => {
                return (
                  <TableItem
                    key={name}
                    userName={name}
                    onSelectButtonClick={onSelectItem}
                    selectButtonText={selectItemButtonText}
                    isAssigned={!!name && !!isDisabledItem ? isDisabledItem(name) : false}
                  />
                )
              })}

            </Tbody>
          </Table>
          {/* <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(users || {}, null, 2)}</pre> */}
        </ModalBody>
        <ModalFooter className='modal-footer-btns-wrapper'>
          {!!formData.userName && <Button size='sm' rounded='2xl' onClick={resetForm} leftIcon={<IoMdClose />} variant='ghost' color='red.500'>Cancel</Button>}
          <Button size='sm' rounded='2xl' variant='outline' onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
