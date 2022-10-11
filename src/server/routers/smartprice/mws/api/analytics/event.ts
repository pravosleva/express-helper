export const analyticsEvent = (req, res) => {
  // NOTE: https://t.ringeo.ru/issue/IT-3250
  const requiredFields = ['uuid', 'analytics_session_id', 'seconds_since_analytics_session_started', 'analytics_session_started_at', 'event']
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
