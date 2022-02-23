export const startRoute = (req, res) => {
  if (!req.body.id) {
    // (session_id) (этот запрос ничего не изменяет на беке,
    // только лишь проверяет состояние сессии и устройств,
    // и если они не подходящие — возвращает ошибку)
    res.status(200).send({
      ok: false,
      message: 'req.body.id is required',
      _originalBody: req.body,
    })
  }

  res.status(200).send({
    ok: true,
    _originalBody: req.body,
  })
}
