import { Response as IResponse, Request as IRequset, NextFunction as INextFunction } from 'express'
import axios from 'axios'

const isDev = process.env.NODE_ENV === 'development'

export const sendNotifyMW = async (req: IRequset, res: IResponse, _next: INextFunction) => {
  const { links, words } = req.body

  if (!links || !Array.isArray(links)) return res.status(200).send({
    ok: false,
    messga: 'Missing req.body.links (string[])',
  })
  if (!words || !Array.isArray(words)) return res.status(200).send({
    ok: false,
    messga: 'Missing req.body.words (string[])',
  })
  
  try {
    const tgBotRes = await axios.post('http://pravosleva.ru/tg-bot-2021/notify/audit-helper-2023/send', {
      // chat_id: 432590698,
      // chat_id: isDev ? 432590698 : -949603342,
      chat_id: -949603342,
      ts: new Date().getTime(),
      eventCode: 'parsing_result_success',
      links,
      words,
    })

    return res.status(200).send({
      ok: true,
      tgBotRes,
    })
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: typeof err === 'string' ? err : (err.message || 'No err.message')
    })
  }
}
