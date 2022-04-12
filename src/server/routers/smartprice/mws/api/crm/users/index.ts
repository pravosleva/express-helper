import delay from '~/utils/delay'
import json from './fake-data/data-0.json'

export const crmUsers = async (req, res) => {
  res.append('Content-Type', 'application/json')

  // TODO: if !delivery -> 403 поле delivery обязательно

  // const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : Boolean(getRandomInteger(0, 1))
  const response = json

  // res.status(toBeOrNotToBe ? 200 : 400).send(response)

  await delay(3000)

  res.status(200).send(response)
}

export * from './me'
