module.exports = (req, res) => {
  res.append('Content-Type', 'application/json')

  // if (!req.is('multipart/form-data')) {
  //   return res.send(500).send({ ok: false, message: 'Is not multipart/form-data' })
  // }

  const base = {
    ok: true,
    names: [
      'ОТДЕЛОМ № 1 УФМС РОССИИ ПО КАБАРДИНО-БАЛКАРСКОЙ РЕСП. В Г. НАЛЬЧИКЕ',
      'ОТДЕЛЕНИЕМ № 1 УФМС РОССИИ ПО КАБАРДИНО-БАЛКАРСКОЙ РЕСП. В Г. НАЛЬЧИКЕ',
      'ОТДЕЛЕНИЕМ УФМС РОССИИ ПО КАБАРДИНО-БАЛКАРСКОЙ РЕСП. В Г. НАЛЬЧИКЕ',
      'МВД ПО КАБАРДИНО-БАЛКАРСКОЙ РЕСП.',
    ],
  }
  const response = {
    ...base,
    _originalParams: { params: req.params },
  }

  return res.status(200).send(response)
}
