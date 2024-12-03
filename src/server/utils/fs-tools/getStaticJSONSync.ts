import fs from 'fs'
import { isValidJsonString } from '../validator'

export const getStaticJSONSync = <T>(storageFilePath: string, initialState: T): T => {
  let text: string = ''

  try {
    // @ts-ignore
    text = fs.readFileSync(storageFilePath)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }

  let data = initialState
  if (isValidJsonString(text)) data = JSON.parse(text)

  return data
}
