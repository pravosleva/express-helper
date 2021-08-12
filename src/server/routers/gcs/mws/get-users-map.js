/* eslint-disable no-shadow */
import { encode } from 'js-base64'
import fs from 'fs'
import path from 'path'

// --- NOTE: FS tools
function isValidJsonString(str) {
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
  let text = ''

  try {
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
// ---

export const getUsersMap = async (req, res) => {
  try {
    const state = req.gcsUsersMapInstance.getState()

    return res.status(200).json({
      success: true,
      usersMap: state,
      _pravosleva: encode('http://pravosleva.ru/express-helper/gcs/add-user'),
      _staticData: getStaticJSONSync(storageFilePath),
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
