import { ListIcon, ListItem } from "@chakra-ui/layout"
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'

type TTask = {
  title: string
  description?: string
  ts: number
  isCompleted: boolean
}

export const TaskItem = ({ data, click }: { data: TTask, click: (_d: any) => void }) => {
  const { title, isCompleted } = data

  return (
    <ListItem
      onClick={click}
    >
      <ListIcon as={isCompleted ? ImCheckboxChecked : ImCheckboxUnchecked} color="green.500" />
      {title}

    </ListItem>
  )
}