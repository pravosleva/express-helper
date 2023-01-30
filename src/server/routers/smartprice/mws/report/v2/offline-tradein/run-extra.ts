import { Response as IResponse, NextFunction as INextFunction } from 'express'
import axios from "axios"
import { TSPRequest } from '~/routers/smartprice/mws/report/v2/types'

const isDev = process.env.NODE_ENV === 'development'

export const runExtraNotifs = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  if (!!req.body?.chat_id || !!req.body?.namespace) {
    let result = null
    try {
      result = await axios.post(isDev ? 'http://localhost:2021/sp-notify/run-extra' : 'http://pravosleva.ru/tg-bot-2021/sp-notify/run-extra', {
        chat_id: req.body.chat_id,
        namespace: req.body?.namespace, // ENamespaces.OFFLINE_TRADEIN_UPLOAD_WIZARD,
      })
        .then(r => r.data)
        .catch(e => e)

      if (result.ok) return res.status(200).send({ ok: true, _service: { result }})
      else return res.status(200).send({
        ok: false,
        message: result?.message || 'External service ERR',
        _service: { result },
      })
    } catch (err) {
      console.log(result)
      console.log(err)
      return res.status(200).send({ ok: false, message: err.message || 'No err.message' })
    }
  }
  else return res.status(400).send({ ok: false, message: 'Incorrect req.body!' })
}
