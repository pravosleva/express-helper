export const getUsersMap = async (req, res) => {
  try {
    const state = {}

    req.usersMap.forEach((value, key) => {
      state[key] = value
    })

    return res.status(200).json({ success: true, usersMap: state })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'No err message' })
  }
}
