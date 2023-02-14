import { Request as IRequest, Response as IResponse } from 'express'

const listByDmitry = [
  '350299942140652',
  '350299942598982',
  '350299941216867',
  '350299942140140',
  '350299942481833',
  '350635586033911',
  '350635585008054',
  '350299942186093',
  '350299944123706',
  '354505626563894',
  '354505627272701',
  '350635583520605',
  '354505622467462',
  '350635585648529',
  '350299942136072',
  '354505622916294',
  '352817862140655',
  '350635585574733',
  '350299941712733',
  '352817861216480',
  '354505622774966',
  '350299941214052',
  '350299943812465',
  '350635582844873',
  '350635585627044',
]
const getRandom = () => listByDmitry[Math.floor(Math.random() * listByDmitry.length)]

export const getRandomFromList = async (_req: IRequest, res: IResponse) => {
  res.append('Content-Type', 'application/json')

  const value = getRandom()

  try {
    const response = {
      ok: true,
      value,
      listByDmitry,
      // _rand: getRandomInteger(1, 100),
    }
  
    return res.status(200).send(response)
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: err.message || 'No err.message',
    })
  }
}
