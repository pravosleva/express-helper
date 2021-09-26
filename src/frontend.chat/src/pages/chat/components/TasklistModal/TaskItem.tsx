import { Td, Tr, Editable, EditablePreview, EditableInput, IconButton } from "@chakra-ui/react"
import { useRef } from "react"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { FaRegTrashAlt } from 'react-icons/fa'

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
  const { title, isCompleted } = data
  // const [isEditModeEnabled, setIsEditModeEnabled] = useState<boolean>(false)
  // const handleEditOpen = () => {
  //   setIsEditModeEnabled(true)
  // }
  // const handleEditClose = () => {
  //   setIsEditModeEnabled(false)
  // }
  // const [titleEdited, setTitleEdited] = useState<string>(data.title)
  const titleEditedRef = useRef<string>(data.title)

  return (
    <Tr>
      <Td color='green.500' onClick={onCompleteToggle}>{isCompleted ? <ImCheckboxChecked size={18} /> : <ImCheckboxUnchecked size={18} />}</Td>
      <Td>
        <Editable
          size='sm'
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
          Send
        </IconButton>
        {/* <Button onClick={handleEditOpen}>EDIT</Button> */}
      </Td>
    </Tr>
  )
}
