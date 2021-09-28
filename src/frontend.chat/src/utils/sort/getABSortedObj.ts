import { stringify } from "querystring"

type TRes = {
  [key: string]: string[]
}

export const getABSortedObj = (arr: string[], substr?: string): TRes => {
  const res: TRes = {}
  const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')

  possibleChars.forEach((char: string) => {
    arr.forEach((str: string) => {
      const firstChar = str[0].toLowerCase()
      if (firstChar === char) {
        if (!!substr) {
          if (str.includes(substr)) {
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
