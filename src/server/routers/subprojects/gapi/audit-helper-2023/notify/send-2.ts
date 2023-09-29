import { Response as IResponse, Request as IRequset, NextFunction as INextFunction } from 'express'
import axios from 'axios'

const isDev = process.env.NODE_ENV === 'development'

type TParserBodyV2 = {
  words: string[];
  report: {
    [key: string]: {
      elmTextList: string[];
    };
  }
}

export const sendNotify2MW = async (req: IRequset, res: IResponse, _next: INextFunction) => {
  const { report, words } = req.body as TParserBodyV2

  if (!report) return res.status(200).send({
    ok: false,
    message: 'Missing req.body.report ([key: string]: {elmTextList: string[]})',
  })
  if (Object.keys(report).length === 0) return res.status(200).send({
    ok: false,
    message: `Incorrect format req.body.report ([key: string]: {elmTextList: string[]}). Object.keys(report).length === 0`,
  })
  if (
    !Object.keys(report).every(
      (key) => !!report[key].elmTextList
      && Array.isArray(report[key].elmTextList)
      && report[key].elmTextList.length > 0
    )
  ) return res.status(200).send({
    ok: false,
    message: `Incorrect format req.body.report ([key: string]: {elmTextList: string[]}). Received: ${JSON.stringify(report)}`,
  })
  if (!words || !Array.isArray(words)) return res.status(200).send({
    ok: false,
    message: 'Missing req.body.words (string[])',
  })
  
  try {
    const tgBotRes = await axios.post('https://pravosleva.pro/tg-bot-2021/notify/audit-helper-2023/send-2', {
      // chat_id: 432590698,
      // chat_id: isDev ? 432590698 : -949603342,
      chat_id: -949603342,
      ts: new Date().getTime(),
      eventCode: 'parsing_result_success_v2',
      report,
      words,
    })

    // console.log(tgBotRes)

    return res.status(200).send({
      ok: true,
      tgBotResData: tgBotRes?.data,
    })
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: typeof err === 'string' ? err : (err.message || 'No err.message')
    })
  }
}
