import { TMessage } from './socket/withSocketChat'

type TProps = {
  messages: TMessage[]
  targetTs: number
}

export const binarySearchTsIndex = ({ messages, targetTs }: TProps) => {
  let result: number = -1
  let left: number = 0
  let right: number = messages.length - 1
  let mid: number

  while (left <= right) {
    mid = Math.round((right - left)/2) + left

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
