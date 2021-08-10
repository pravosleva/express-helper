import { Request as IRequest, Response as IResponse } from 'express'

export const generate = async (req: IRequest, res: IResponse) => {
  const { userName, chatData } = req.body

  if (!userName || !chatData) {
    return res
      .status(401)
      .json({ ok: false, message: 'Missing required parameter: "payload"' })
  }

  // @ts-ignore
  req.usersMap.set(userName, chatData)

  return res.status(200).json({ success: true })
}
