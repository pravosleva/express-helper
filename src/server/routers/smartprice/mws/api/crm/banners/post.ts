import delay from '~/utils/delay'

const isBodyValid = (body): boolean => {
  let result = false

  if (Array.isArray(body) && body.every(({ id, position }) => !!id && !!position && !Number.isNaN(position))) result = true

  return result
}

export const crmBannersPOST = async (req, res) => {
  res.append('Content-Type', 'application/json')

  const { body } = req

  if (!isBodyValid(body)) return res.status(400).send({
    ok: false,
    message: 'Invalid body',
    _service: {
      req: {
        params: req.params,
        query: req.query,
      },
    },
  })

  await delay(1000)

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
