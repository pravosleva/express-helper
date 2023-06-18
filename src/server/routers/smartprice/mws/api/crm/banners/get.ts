import v0 from './fake-data/case-v0-2023-06-10.json'

export const crmBannersGET = async (req, res) => {
  res.append('Content-Type', 'application/json')

  return res.status(200).send(v0)
}
