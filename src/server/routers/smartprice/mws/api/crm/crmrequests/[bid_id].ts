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

  const {
    _dev_scenario_settings,
    ...restNewData
  } = req.body

  // if (dbs_special === true || req.dbs_special === false) response.dbs_special = dbs_special

  if (!!_dev_scenario_settings) {
    try {
      const { status } = _dev_scenario_settings

      switch (true) {
        case !!status && !Number.isNaN(status):
          return res.status(status).send({
            ...response,
            ...restNewData,
            _service: {
              originalBody: req.body,
            },
          })
        default:
          throw new Error('No case for your params')
      }
    } catch (err) {
      return res.status(403).send({
        _service: {
          originalBody: req.body,
        },
        message: typeof err === 'string' ? err : (err?.message || 'No err.message')
      })
    } 
  }

  await delay(1000)

  return res.status(200).send({
    ...response,
    ...restNewData,
  })
}
