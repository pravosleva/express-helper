import { memo } from 'react'
// @ts-ignore
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useMediaQuery,
} from '@chakra-ui/react'
import { md } from '~/common/chakra/theme'
// import { DatepickerModal } from './components/DatepickerModal'
import { TasklistContent } from './components'
// import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'

type TProps = {
  isOpened: boolean
  onClose: () => void
  data: any
}

export const TasklistModal = memo(({ isOpened, onClose, data }: TProps) => {
  // const [isPending, startTransition] = useTransition();
  const [downToSm] = useMediaQuery(`(max-width: ${md}px)`)
  // const [upToSm] = useMediaQuery(`(min-width: ${md + 1}px)`)

  return (
    <>
      <Modal
        size={downToSm ? 'lg' : 'sm'}
        isOpen={isOpened}
        onClose={onClose}
        scrollBehavior='inside'
      >
        <ModalOverlay className='backdrop-blur--transparent' />
        <ModalContent
          rounded='2xl'
        >
          <ModalCloseButton rounded='3xl' />
          <TasklistContent
            data={data}
            asModal
            modalHeader='Tasklist'
          />
          {/* <ModalFooter
            className='modal-footer-btns-wrapper'
          >
            No footer
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  )
})
