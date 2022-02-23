export const confirmRoute = (req, res) => {
  // NOTE: Метод позволяет уведомить SP о подтверждении передачи устройств
  // представителю парьнера клиентом
  /* REQ SAMPLE:
  { "id": 456, "code": "iddqd", t: 1496275200, s: "123o0123oi1i23iu123iu23u" } */
  const requiredFields = ['id', 'code', 't', 's']
  const errs = []
  for (const key of requiredFields) if (!req.body[key]) errs.push(`${key} is required!`)
  if (errs.length > 0) {
    return res.status(200).send({
      ok: false,
      message: `Incorrect params: ${errs.join('; ')}`,
      _originalBody: req.body,
    })
  }

  res.status(200).send({
    ok: true,
    _originalBody: req.body,
  })
}
