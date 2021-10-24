import { binarySearchIndex } from './binarySearch'

type TRes = {
  [key: string]: string[]
}

export const getABSortedObj0 = (arr: string[], substr?: string): TRes => {
  const res: TRes = {}
  const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  const lowerCaseArr = arr.map((w) => w.toLowerCase())

  possibleChars.forEach((char: string) => {
    lowerCaseArr.forEach((str: string) => {
      const firstChar = str[0].toLowerCase()

      if (firstChar === char) {
        if (!!substr) {
          if (str.includes(substr.toLowerCase())) {
            if (!res[firstChar]) {
              res[firstChar] = [str]
            } else {
              res[firstChar].push(str)
            }
          } else {
            // NOTHING
          }
        } else {
          if (!res[firstChar]) {
            res[firstChar] = [str]
          } else {
            res[firstChar].push(str)
          }
        }
      }
    })
  })

  return res
}

export const getABSortedObj = (arr: string[], substr?: string): TRes => {
  const res: TRes = {}
  const lowerCaseArr = arr.map((w) => w.toLowerCase())

  lowerCaseArr.forEach((str: string) => {
    const firstChar = str[0].toLowerCase()

    if (!!substr) {
      if (str.includes(substr.toLowerCase())) {
        if (!res[firstChar]) {
          res[firstChar] = [str]
        } else {
          const targetIndex = binarySearchIndex(res[firstChar], str)
    
          res[firstChar].splice(targetIndex, 0, str)
        }
      } else {
        // NOTHING
      }
    } else {
      if (!res[firstChar]) {
        res[firstChar] = [str]
      } else {
        // res[firstChar].push(str)
        const targetIndex = binarySearchIndex(res[firstChar], str)
  
        res[firstChar].splice(targetIndex, 0, str)
      }
    }
  })

  return res
}

export const getABSortedObj2 = (arr: string[], substr?: string): TRes => {
  const res: TRes = {}
  const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')

  possibleChars.forEach((char: string) => {
    arr.forEach((str: string) => {
      const firstChar = str[0].toLowerCase()

      if (firstChar === char) {
        if (!!substr) {
          if (str.includes(substr.toLowerCase())) {
            if (!res[firstChar]) {
              res[firstChar] = [str]
            } else {
              const targetIndex = binarySearchIndex(res[firstChar], str)
        
              res[firstChar].splice(targetIndex, 0, str)
            }
          } else {
            // NOTHING
          }
        } else {
          if (!res[firstChar]) {
            res[firstChar] = [str]
          } else {
            // res[firstChar].push(str)
            const targetIndex = binarySearchIndex(res[firstChar], str)
      
            res[firstChar].splice(targetIndex, 0, str)
          }
        }
      }
    })
  })

  return res
}
