import express from 'express'
// Create application/json parser
import bodyParser from 'body-parser'
import { startRoute } from './start'
import { confirmRoute } from './confirm'

const jsonParser = bodyParser.json()
const courierApi = express()

// NOTE: See docs https://t.ringeo.ru/issue/IT-2872#focus=Comments-4-9320.0-0

const indexRoute = (req, res) => {
  // NOTE: Метод позволяет уведомить SP о происходящей в настоящей момент времени
  // передаче устройств от клиента представителю партнера
  /* REQ SAMPLE:
  { "id": 456, "imeis": ["012345678901234", "123456789012345"], t: 1496275200, s: "123o0123oi1i23iu123iu23u" } */
  const requiredFields = ['id', 'imeis', 't', 's']
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

courierApi.post('/', jsonParser, indexRoute)
courierApi.post('/start', jsonParser, startRoute)
courierApi.post('/confirm', jsonParser, confirmRoute)

export default courierApi
