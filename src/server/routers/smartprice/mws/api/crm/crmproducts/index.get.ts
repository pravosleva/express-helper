import v0_Samsung from './fake-data/v0.Samsung.json'
// import delay from '~/utils/delay'

const possibleResponse = {
  'Samsung': v0_Samsung,
}

export const crmProductsIndexGet = async (req, res) => {
  const { query } = req
  let vendor = query.vendor
  if (!vendor) {
    // return res.status(400).send({
    //   ok: false,
    //   message: 'Missing propp: req.query.vendor',
    // })
    vendor = 'Smasung'
  }

  // TODO: if !delivery -> 403 поле delivery обязательно

  // const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : Boolean(getRandomInteger(0, 1))
  const response = possibleResponse[vendor] || v0_Samsung

  // res.status(toBeOrNotToBe ? 200 : 400).send(response)

  // await delay(1000)

  res.append('Content-Type', 'application/json')
  return res.status(200).send(response)
}
