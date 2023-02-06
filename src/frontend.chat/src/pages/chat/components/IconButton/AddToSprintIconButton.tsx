import { IconButton, Tooltip } from "@chakra-ui/react"
import { useContext, memo } from "react"
import { BsFillCalendarFill } from "react-icons/bs"
import { MainContext } from "~/context/mainContext"
import { EMessageStatus, TMessage, /* ERegistryLevel */ } from '~/utils/interfaces'

type TKanbanCard = { id: number, title: EMessageStatus, description: string }

type TProps = {
  handleAddToSprintKanbanCard: (card: TKanbanCard) => () => void
  card: TKanbanCard & TMessage
}

export const AddToSprintIconButton = memo(({
  handleAddToSprintKanbanCard,
  card,
}: TProps) => {
  const {
    name,
    // slugifiedRoom: room, roomRef, setRoom, isAdmin, tsMap, tsMapRef, sprintFeatureProxy, userInfoProxy, assignmentFeatureProxy, devtoolsFeatureProxy,
  } = useContext(MainContext)

  return (
    <Tooltip label='Добавить в спринт' aria-label='ADD_TO_SPRINT'>
      <IconButton
        size='xs'
        aria-label="-ADD_TO_SPRINT"
        colorScheme='gray'
        variant='ghost'
        isRound
        icon={<BsFillCalendarFill size={17} />}
        onClick={handleAddToSprintKanbanCard(card)}
        isDisabled={card.user !== name}
      >
        ADD_TO_SPRINT
      </IconButton>
    </Tooltip>
  )
})
