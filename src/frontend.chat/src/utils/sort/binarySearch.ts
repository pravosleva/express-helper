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
