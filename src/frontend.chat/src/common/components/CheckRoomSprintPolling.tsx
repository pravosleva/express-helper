import { useEffect } from 'react'
import { useMainContext } from '~/mainContext'
import { useSnapshot } from 'valtio'
import { useFetchLooper } from '~/common/hooks/useFetchLooper'

const isDev = process.env.NODE_ENV === 'development'
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || ''

export const CheckRoomSprintPolling = () => {
  const { room, sprintFeatureProxy } = useMainContext()
  const sprintFeatureSnap = useSnapshot(sprintFeatureProxy)
  const { state } = useFetchLooper({
    validate: {
      // NOTE: No request if false (Worker runner will not be started)
      beforeRequest: (payload: any) =>
        !!payload.body.room_id // Room selected
        && !document.hidden, // Browser tab is active
    },
    cb: {
      onUpdateState: ({ state }) => {
        if (isDev) console.log('- state effect: new state!')
        const result = state
        if (!!result) {
          switch (true) {
            case (result instanceof Error):
              sprintFeatureProxy.isPollingWorks = false
              break;
            case result.code === 'not_found': // EAPIRoomNotifsCode.NotFound:
              sprintFeatureProxy.isPollingWorks = true
              sprintFeatureProxy.isEmptyStateConfirmed = true
              break;
            default:
              sprintFeatureProxy.isPollingWorks = true
              if (!!result.state && Object.keys(result.state).length === 0) {
                sprintFeatureProxy.isEmptyStateConfirmed = true
              }
              break;
          }
      
          if (result.ok && result.tsUpdate !== sprintFeatureSnap.tsUpdate) {
            try {
              sprintFeatureProxy.commonNotifs = result.state
              if (Object.keys(result.state).length > 0) {
                sprintFeatureProxy.isEmptyStateConfirmed = false
              } else {
                sprintFeatureProxy.isEmptyStateConfirmed = true
              }
            } catch (err) {
              console.log(err)
            }
            
            sprintFeatureProxy.tsUpdate = result.tsUpdate
          }
        }
      }
    },
    runnerAction: {
      type: 'check-room-state',
      payload: {
        url: `${REACT_APP_API_URL}/chat/api/common-notifs/check-room-state`,
        method: 'POST',
        body: { room_id: room, tsUpdate: sprintFeatureSnap.tsUpdate },
      }
    },
    timeout: 4000,
  })
  // ---

  return null
}
