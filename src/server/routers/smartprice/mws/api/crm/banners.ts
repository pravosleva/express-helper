import delay from '~/utils/delay'

const isBodyValid = (body): boolean => {
  let result = false

  if (Array.isArray(body) && body.every(({ id, position }) => !!id && !!position && !Number.isNaN(position))) result = true

  return result
}

export const crmBanners = async (req, res) => {
  res.append('Content-Type', 'application/json')

  const { body } = req

  if (!isBodyValid(body)) return res.status(400).send({
    ok: false,
    message: 'Invalid body',
  })

  await delay(1000)

  return res.status(200).send({
    ok: true,
    message: 'TODO: Выяснить формат ответа',
  })
}
