import json from '../fake-data/add-banner-v0.json'

export const crmAddBanner = async (req, res) => {
  res.append('Content-Type', 'application/json')

  return res.status(200).send({
    ...json,
    _service: {
      req: {
        params: req.params,
        query: req.query,
      },
    },
    message: 'TODO: Нет нормального формата ответа',
  })
}
