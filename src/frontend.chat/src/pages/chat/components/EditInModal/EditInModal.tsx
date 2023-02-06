import { useColorMode, useMediaQuery, Button, FormControl, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea } from "@chakra-ui/react"
import { useRef, memo } from "react"
import { md } from '~/common/chakra/theme'

type TProps = {
  isEditModalOpen: boolean
  handleEditModalClose: () => void
  editedMessage: any
  handleChangeEditedMessage: (e: any) => void
  debouncedEditedMessageText: string
  handleSaveEditedMessage: ({ assignedTo }: { assignedTo?: string[] }, cb?: () => void) => void
}

export const EditInModal = memo(({
  isEditModalOpen,
  handleEditModalClose,
  editedMessage,
  handleChangeEditedMessage,
  debouncedEditedMessageText,
  handleSaveEditedMessage,
}: TProps) => {
  const [upToMd] = useMediaQuery(`(min-width: ${md + 1}px)`)
  const initialFocusRef = useRef(null)
  const finalFocusRef = useRef(null)
  const mode = useColorMode()
  // const [text, setText] = useState<string>('')

  return (
    <Modal
      size={upToMd ? 'md' : 'full'}
      initialFocusRef={initialFocusRef}
      finalFocusRef={finalFocusRef}
      isOpen={isEditModalOpen}
      onClose={handleEditModalClose}
    >
      <ModalOverlay />
      <ModalContent
        rounded={upToMd ? '2xl' : 'none'}
      >
        <ModalHeader>
          Edit
        </ModalHeader>
        <ModalCloseButton rounded='3xl' />
        <ModalBody
          p={0}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/*!!debouncedEditedMessageText && (
              <div style={{
                // padding: '5px 0 5px 0',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}>
                <pre style={{
                  fontSize: '0.8em',
                  border: '1px solid inherit',
                  padding: '5px',
                  marginBottom: '10px',
                  backgroundColor: 'gray',
                  color: '#FFF',
                  borderRadius: 0,
                  maxHeight: '200px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowY: 'auto',
                }}>{debouncedEditedMessageText}</pre>
              </div>
              )*/}

            <div
              style={{
                // padding: upToMd ? '0 var(--chakra-space-6)' : '0 var(--chakra-space-6) 0 var(--chakra-space-20)',
                padding: '0 var(--chakra-space-6)',
              }}
            >
              <FormControl>
                {/* <FormLabel>Text</FormLabel> */}
                <Textarea
                  style={{
                    backgroundColor: mode.colorMode === 'dark' ? 'var(--chakra-colors-blackAlpha-600)' : 'var(--chakra-colors-blackAlpha-600)',
                    color: mode.colorMode === 'dark' ? 'inherit' : '#FFF'
                  }}
                  isInvalid={!editedMessage?.text}
                  resize="vertical"
                  placeholder="Message"
                  ref={initialFocusRef}
                  // onKeyDown={handleKeyDownEditedMessage}
                  // value={editedMessage?.text}
                  defaultValue={editedMessage?.text}
                  onChange={handleChangeEditedMessage}
                  fontSize='lg'
                  rows={10}
                />
              </FormControl>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            // @ts-ignore
            onClick={handleSaveEditedMessage}
            size='sm'
            rounded='2xl'
          >
            Save
          </Button>
          <Button size='sm' rounded='2xl' onClick={handleEditModalClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
