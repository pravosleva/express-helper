import { writeStaticJSONAsync, getStaticJSONSync } from '../../../utils/fs-tools'

// const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_PRAVOSLEVA_2021

export const addEntryRoute = async (req, res, next) => {
  const { userState } = req.body

  if (!userState) {
    return res.status(401).send({
      success: false,
      _originalParams: { params: req.params },
    })
  }

  if (!!req.botStorageFilePath) {
    try {
      const { entryData: { contact: { user_id } } } = userState
  
      const staticData = getStaticJSONSync(req.botStorageFilePath)
      const ts = new Date().getTime()
      let myNewData: any = { ...userState }
      const myOldData = staticData[String(user_id)]

      if (!!myOldData) myNewData = { ...myOldData, ...myNewData }

      if (myNewData?.count) {
        const count = myNewData?.count
  
        myNewData = { ...myNewData, count: count + 1, ts }
      } else {
        myNewData = { ...myNewData, count: 1, ts }
      }

      staticData[String(user_id)] = myNewData

      console.log(staticData)

      writeStaticJSONAsync(req.botStorageFilePath, staticData)

      return res.status(200).json({ ok: true, staticData })
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        ok: false,
        message: err.message || 'No err.message',
        _originalParams: { params: req.params },
      })
    }
  }
  next()
}
