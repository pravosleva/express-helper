export const binarySearchIndex = (arr: string[], targetValue: string) => {
  let index: number = -1
  let left: number = 0
  let right: number = arr.length - 1
  let mid: number

  while (left <= right) {
    mid = Math.round((right + left)/2)
    
    if (targetValue === arr[mid]) {
      index = mid
      return index
    } else if (targetValue < arr[mid]) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  return index
}

enum ERegistryLevel {
  Guest = 0,
  Logged = 1,
  TGUser = 2
}
type TMessage = {
  text: string
  ts: number
  editTs?: number
  rl?: ERegistryLevel
  user: string
}
type TRoomTask = {
  title: string
  description?: string
  isCompleted: boolean
  ts: number
  editTs?: number
}
type TProps = {
  messages: TMessage[] | TRoomTask[]
  targetTs: number
}

export const binarySearchTsIndex = ({ messages, targetTs }: TProps) => {
  let result: number = -1
  let left: number = 0
  let right: number = messages.length - 1
  let mid: number

  while (left <= right) {
    // mid = Math.round((right - left)/2) + left
    mid = Math.round((right + left)/2)
    
    if (targetTs === messages[mid].ts) {
      result = mid
      return result
    } else if (targetTs < messages[mid].ts) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  return result
}
