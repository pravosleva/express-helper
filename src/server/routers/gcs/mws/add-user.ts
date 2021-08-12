import { Request as IRequest, Response as IResponse } from 'express'
import fs from 'fs'
import path from 'path'

// --- NOTE: FS tools
function isValidJsonString(str: string) {
  try {
    JSON.parse(str)
  } catch (_err) {
    return false
  }
  return true
}
const projectRootDir = path.join(__dirname, '../../../../')
const GCS_USERS_FILE_NAME = process.env.GCS_USERS_FILE_NAME || 'gcs-users.json'
const storageFilePath = path.join(projectRootDir, '/storage', GCS_USERS_FILE_NAME)

const getStaticJSONSync = () => {
  let text: string = ''

  try {
    // @ts-ignore
    text = fs.readFileSync(storageFilePath)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }

  let data = {}
  if (isValidJsonString(text)) {
    data = JSON.parse(text)
  }
  return data
}
const writeStaticJSONAsync = (newJSON: { [key: string]: any }) => {
  fs.writeFile(storageFilePath, JSON.stringify(newJSON), 'utf8', (err) => {
    console.log(err)
  })
}
// ---

export const addUser = async (req: IRequest, res: IResponse) => {
  const { userName, chatData } = req.body

  if (!userName || !chatData) {
    return res
      .status(401)
      .json({ ok: false, message: 'Missing required parameter: "payload"' })
  }

  // @ts-ignore
  req.gcsUsersMapInstance.addUser({ userName, chatData })

  const json = getStaticJSONSync()
  json[userName] = chatData
  writeStaticJSONAsync(json)

  return res.status(200).json({ success: true })
}
