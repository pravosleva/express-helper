export const crmDeleteBanner = async (req, res) => {
  res.append('Content-Type', 'application/json')

  return res.status(200).send({
    ok: true,
    message: 'TODO: Нет нормального формата ответа',
    _service: {
      req: {
        params: req.params,
        query: req.query,
      },
    },
  })
}
