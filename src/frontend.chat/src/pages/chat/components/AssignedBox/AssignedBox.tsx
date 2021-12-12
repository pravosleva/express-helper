import {
  Box,
  Button,
} from '@chakra-ui/react'
import { UserAva } from '~/pages/chat/components/UserAva'
import { useMainContext } from '~/mainContext'

type TProps = {
  assignedTo: string[]
  assignedBy: string
  onUnassign: (assignedUserName: string) => void
  isMyMessage: boolean
}

export const AssignedBox = ({
  assignedTo,
  assignedBy,
  onUnassign,
  isMyMessage,
}: TProps) => {
  const { name } = useMainContext()
  const isMeAssigner = name === assignedBy
  const isAssignedToMe = name === assignedTo[0]

  return (
    <Box className='centered-box assigned-box'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ marginRight: '.5rem' }}>Assigned&nbsp;to&nbsp;👉</div>
          <UserAva size={20} name={assignedTo[0]} mr='.5rem' fontSize={10} />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 'var(--chakra-fontSizes-sm)' }}><b>{assignedTo[0]}</b></div>
            {
              (isMyMessage || isMeAssigner || isAssignedToMe) && (
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