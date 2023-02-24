import { binarySearchIndex } from "~/utils/sort/binarySearch"
import { TTask } from '~/pages/chat/components/TasklistModal/types'
import { Designer } from '~/utils/Designer'

const designer = new Designer()

type TRes = {
  [key: string]: TTask[]
}

const testWordByAnyWord = ({ testedWord, words }: { testedWord: string, words: string[] }): boolean => {
  const modifiedWords = words.join(' ').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const regexpGroups = modifiedWords.split(' ').map((w) => ['(?=.*' + w + ')'])
  const regexp = new RegExp('^' + regexpGroups.join('|') + '.*$', 'im')

  return regexp.test(testedWord)
}

export const getABSortedObjByObjects = ({ arr, substr }: { arr: TTask[], substr?: string }): TRes => {
  const res: TRes = {}
  // const 
  const lowerCaseArr = arr.map(({ title }) => title.toLowerCase())

  lowerCaseArr.forEach((str: string, i: number) => {
    const firstChar = str[0].toLowerCase()

    if (!!substr) {
      if (
        testWordByAnyWord({ testedWord: str, words: substr.split(' ') })
        // str.includes(substr.toLowerCase())
      ) {
        if (!res[firstChar]) {
          res[firstChar] = [arr[i]]
        } else {
          const targetIndex = binarySearchIndex(res[firstChar].map(({ title }) => title), str)
    
          res[firstChar].splice(targetIndex, 0, arr[i])
        }
      } else {
        // NOTHING
      }
    } else {
      if (!res[firstChar]) {
        res[firstChar] = [arr[i]]
      } else {
        // res[firstChar].push(str)
        const targetIndex = binarySearchIndex(res[firstChar].map(({ title }) => title), str)
  
        res[firstChar].splice(targetIndex, 0, arr[i])
      }
    }
  })

  const finalRes: TRes = {}
  const sortedKeys = designer.getABSorted(Object.keys(res))

  sortedKeys.forEach((key, i) => {
    finalRes[key] = designer.abSortObjectsByFieldName({
      arr: res[key],
      targetFieldName: 'title',
    })
  })

  return finalRes
}
