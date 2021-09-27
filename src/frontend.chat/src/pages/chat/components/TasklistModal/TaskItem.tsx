import {
  Td, Tr, Editable, EditablePreview, EditableInput,
  IconButton,
  // useEditableControls, ButtonGroup, Flex, Button,
} from "@chakra-ui/react"
import { useRef } from "react"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { FaRegTrashAlt } from 'react-icons/fa'
// import { IoMdAdd, IoMdClose } from 'react-icons/io'
// import { MdModeEdit } from 'react-icons/md'

type TTask = {
  title: string
  description?: string
  ts: number
  isCompleted: boolean
}
type TProps = {
  data: TTask
  onCompleteToggle: () => void
  onDelete: (ts: number) => void
  onEdit: (newData: any) => void
}

export const TaskItem = ({ data, onCompleteToggle, onDelete, onEdit }: TProps) => {
  const {
    title,
    // description,
    isCompleted,
  } = data
  const titleEditedRef = useRef<string>(data.title)
  // const descriptionEditedRef = useRef<string | undefined>(data.description || 'No descr')

  // function EditableControls() {
  //   const {
  //     isEditing,
  //     getSubmitButtonProps,
  //     getCancelButtonProps,
  //     getEditButtonProps,
  //   } = useEditableControls()

  //   return isEditing ? (
  //     <ButtonGroup justifyContent="flex-start" size="sm">
  //       <IconButton aria-label='Check' icon={<ImCheckboxChecked />} {...getSubmitButtonProps()} />
  //       <IconButton aria-label='Close' icon={<IoMdClose />} {...getCancelButtonProps()} />
  //     </ButtonGroup>
  //   ) : (
  //     <Flex justifyContent="flex-start">
  //       <Button
  //         aria-label='Edit'
  //         size="sm"
  //         // </Flex>leftIcon={<MdModeEdit />}
  //         {...getEditButtonProps()}
  //       >Set description</Button>
  //     </Flex>
  //   )
  // }
  
  return (
    <Tr>
      <Td
        color='green.500'
        onClick={onCompleteToggle}>{isCompleted ? <ImCheckboxChecked size={18} /> : <ImCheckboxUnchecked size={18} />}
      </Td>
      <Td fontWeight='bold'>
        <div>
          <Editable
            defaultValue={title}
            onChange={(nextVal: string) => {
              titleEditedRef.current = nextVal
            }}
            onSubmit={() => {
              onEdit({ ...data, title: titleEditedRef.current })
            }}
          >
            <EditablePreview />
            <EditableInput />
          </Editable>
        </div>
        {/* <div>
          <Editable
            defaultValue={description}
            onChange={(nextVal: string) => {
              descriptionEditedRef.current = nextVal
            }}
            onSubmit={() => {
              onEdit({ ...data, description: descriptionEditedRef.current })
            }}
            // isPreviewFocusable={false}
          >
            {!!description && <EditablePreview />}
            <EditableInput />
            {!description && <EditableControls />}
          </Editable>
        </div> */}
      </Td>
      <Td isNumeric>
        <IconButton
          aria-label="DEL"
          isRound
          icon={<FaRegTrashAlt size={15} />}
          onClick={() => onDelete(data.ts)}
          // disabled={!message}
          // isLoading={isSending}
        >
          DEL
        </IconButton>
        {/* <Button onClick={handleEditOpen}>EDIT</Button> */}
      </Td>
    </Tr>
  )
}
