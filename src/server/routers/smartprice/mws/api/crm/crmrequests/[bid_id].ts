import delay from '~/utils/delay'
import json from './fake-data/[bid_id]=539005.json'

export const crmBidId = async (req, res) => {
  res.append('Content-Type', 'application/json')

  const response: any = {
    ...json,
    _service: {
      originalBody: req.body,
      originalQuery: req.query,
      reqParams: req.params,
    },
  }

  const { dbs_special, isFuckupTest } = req.body

  if (dbs_special === true || req.dbs_special === false) response.dbs_special = dbs_special

  if (isFuckupTest) {
    return res.status(403).send({
      message: 'Custom fuckup'
    })
  }

  await delay(1000)

  return res.status(200).send(response)
}
