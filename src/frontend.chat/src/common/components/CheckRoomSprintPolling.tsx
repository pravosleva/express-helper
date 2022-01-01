import { useFetchLooper } from '~/common/hooks/useFetchLooper'

// const isDev = process.env.NODE_ENV === 'development'
// const REACT_APP_API_URL = process.env.REACT_APP_API_URL || ''

type TProps = {
  interval: number
  payload: {
    url: string
    method: 'GET' | 'POST'
    body?: any
  }
  validateBeforeRequest: (payload: any) => boolean
  cbOnUpdateState?: (obj: any) => void
}

export const CheckRoomSprintPolling = ({ payload, interval, validateBeforeRequest, cbOnUpdateState }: TProps) => {
  const { url, method, body } = payload
  const fetchOpts: any = { url, method }
  if (!!body) fetchOpts.body = body
  const { state } = useFetchLooper({
    runnerAction: {
      type: 'check-room-state',
      payload: fetchOpts,
    },
    timeout: interval,
    validate: {
      // NOTE: No request if false (Worker runner will not be started)
      beforeRequest: validateBeforeRequest,
    },
    cb: {
      onUpdateState: cbOnUpdateState
    },
  })
  // ---

  return null
}
