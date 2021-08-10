import base64 from 'base64'

export const getUsersMap = async (req, res) => {
  try {
    const state = req.gcsUsersMapInstance.getState()

    return res.status(200).json({
      success: true,
      usersMap: state,
      _pravosleva: base64.encode('http://pravosleva.ru/express-helper/gcs/add-user'),
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
