import {
  Box,
  Button,
} from '@chakra-ui/react'
import { UserAva } from '~/pages/chat/components/UserAva'
import { useMainContext } from '~/context/mainContext'

type TProps = {
  assignedTo: string[]
  assignedBy: string
  onUnassign?: (assignedUserName: string) => void
  isMyMessage?: boolean
  position?: 'right' | 'left' | 'center'
}

export const AssignedBox = ({
  assignedTo,
  assignedBy,
  onUnassign,
  isMyMessage,
  position,
}: TProps) => {
  const { name } = useMainContext()
  const isMeAssigner = name === assignedBy
  const isAssignedToMe = name === assignedTo[0]

  return (
    <Box className={!!position ? `${position}-box` : 'right-box'} style={{ marginTop: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ marginRight: '.5rem' }}>Assigned&nbsp;to&nbsp;👉</div>
        <UserAva size={19} name={assignedTo[0]} mr='.5rem' fontSize={11} />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 'var(--chakra-fontSizes-sm)' }}><b>{assignedTo[0]}</b></div>
          {
            (isMyMessage || isMeAssigner || isAssignedToMe) && !!onUnassign && (
              <div>
                <Button ml={2} size='sm' variant='link' onClick={() => {
                  // handleUnassignFromUser(message, assignedTo[0])
                  onUnassign(assignedTo[0])
                }} rounded='3xl'>Unassign</Button>
              </div>
            )
          }
        </div>
      </div>
    </Box>
  )
}