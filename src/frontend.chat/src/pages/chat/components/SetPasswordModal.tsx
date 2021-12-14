import React, { useState, useRef } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  FormControl,
  Input,
  ModalFooter,
  useToast,
} from '@chakra-ui/react'
import { useSocketContext } from '~/socketContext'
import { useMainContext } from '~/mainContext'

type TProps = {
  isOpened: boolean
  onClose: () => void
}

export const SetPasswordModal = ({ isOpened, onClose }: TProps) => {
  const [newPasValue, setNewPasValue] = useState<string>('')
  const [confPasValue, confNewPasValue] = useState<string>('')
  const initialSetPasswdRef = useRef(null)
  const { socket } = useSocketContext()
  const toast = useToast()
  const { name } = useMainContext()

  const handleSetMyPassword = ({ password }: { password: string }) => {
    if (newPasValue !== confPasValue) {
      toast({
        position: 'bottom',
        title: 'Sorry',
        description: 'Пароли не совпадают',
        status: 'error',
        duration: 7000,
        isClosable: true,
      })
      return
    }
    if (!!socket) {
      socket.emit('login.set-pas-level-1', { password, name }, (errMsg?: string) => {
        if (!!errMsg) {
          toast({
            position: 'top',
            // title: 'Sorry',
            description: errMsg,
            status: 'error',
            duration: 7000,
            isClosable: true,
          })
          return
        }
        onClose()
      })
    } else {
      toast({
        position: 'top',
        // title: 'Sorry',
        description: 'ERR: Попробуйте перезайти',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal
        size="xs"
        initialFocusRef={initialSetPasswdRef}
        // finalFocusRef={textFieldRef}
        isOpen={isOpened}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create your password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/*
            <FormControl mt={4}>
              <FormLabel>Login</FormLabel>
              <Input
                type='login'
                placeholder="Login"
                isDisabled
                value={name}
              />
            </FormControl>
            */}
            <FormControl mb={4}>
              <FormLabel>Password</FormLabel>
              <Input
                isInvalid={!newPasValue}
                type='password'
                placeholder="Password"
                ref={initialSetPasswdRef}
                // onKeyDown={handleKeyDownEditedMessage}
                value={newPasValue}
                onChange={(e) => {
                  setNewPasValue(e.target.value)
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirm password</FormLabel>
              <Input
                isInvalid={!confPasValue}
                type='password'
                placeholder="Confirm password"
                // onKeyDown={handleKeyDownEditedMessage}
                value={confPasValue}
                onChange={(e) => {
                  confNewPasValue(e.target.value)
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => {
              handleSetMyPassword({ password: newPasValue })
            }}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  )
}