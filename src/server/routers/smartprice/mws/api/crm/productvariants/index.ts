export * from './all_params'
export * from './ready_for_selling'

import delay from '~/utils/delay'
import json from './fake-data/index-product=1453-product_vendor=Apple.json'

export const crmProductVariantsIndex = async (req, res) => {
  res.append('Content-Type', 'application/json')

  // TODO: if !delivery -> 403 поле delivery обязательно

  // const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : Boolean(getRandomInteger(0, 1))
  const response = {
    ...json,
    _service: {
      originalQuery: req.query,
      originalBody: req.body,
      reqParams: req.params,
    },
  }

  // res.status(toBeOrNotToBe ? 200 : 400).send(response)

  await delay(1000)

  res.status(200).send(response)
}
