import { memo } from 'react'
import {
  Box,
  Button,
} from '@chakra-ui/react'
import { UserAva } from '~/pages/chat/components/UserAva'
import { useMainContext } from '~/context/mainContext'
import styles from '~/App.module.scss'

type TProps = {
  assignedTo: string[]
  assignedBy: string
  onUnassign?: (assignedUserName: string) => void
  isMyMessage?: boolean
  position?: 'right' | 'left' | 'center'
}

export const AssignedBox = memo(({
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
    <Box className={!!position ? styles[`${position}-box`] : styles['right-box']} style={{ marginTop: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <UserAva size={19} name={assignedBy} mr='.5rem' fontSize={11} />
        <div style={{ marginRight: '.5rem' }}>👉</div>
        <UserAva size={19} name={assignedTo[0]} mr='.5rem' fontSize={11} />
        {
          (isMyMessage || isMeAssigner || isAssignedToMe) && !!onUnassign && (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div>
                <Button ml={2} size='sm' variant='link' onClick={() => {
                  // handleUnassignFromUser(message, assignedTo[0])
                  onUnassign(assignedTo[0])
                }} rounded='3xl'>Unassign</Button>
              </div>
            </div>
          )
        }
      </div>
    </Box>
  )
})
