import {
  Box,
  Button,
} from '@chakra-ui/react'
import { UserAva } from '~/pages/chat/components/UserAva'

type TProps = {
  assignedTo: string[]
  onUnassign: (assignedUserName: string) => void
  isMyMessage: boolean
}

export const AssignedBox = ({
  assignedTo,
  onUnassign,
  isMyMessage,
}: TProps) => {
  return (
    <Box className='centered-box assigned-box'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ marginRight: '.5rem' }}>Assigned&nbsp;to&nbsp;👉</div>
          <UserAva size={33} name={assignedTo[0]} mr='.5rem' />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 'var(--chakra-fontSizes-sm)' }}><b>{assignedTo[0]}</b></div>
            {
              isMyMessage && (
                <div>
                  <Button size='sm' onClick={() => {
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