import delay from '~/utils/delay'
import json from './fake-data/[bid_id]=539005.json'

export const crmBidId = async (req, res) => {
  res.append('Content-Type', 'application/json')

  const response = {
    ...json,
    _service: {
      originalBody: req.body,
      originalQuery: req.query,
      reqParams: req.params,
    },
  }

  await delay(1000)

  res.status(200).send(response)
}
