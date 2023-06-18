/* eslint-disable prefer-destructuring */
const { getRandomInteger } = require('../../../../../../utils/getRandomInteger')
const delay = require('../../../../../../utils/delay')

// const { SUCCESS_ANYWAY } = process.env

// NOTE: See also https://t.ringeo.ru/issue/IT-2236#focus=streamItem-4-7775.0-0
/*
xlsx_file - файл с устройствами
hub - название хаба
courier - название курьера из списка (например cdek)
scheduled_date - дата вывоза
dry_run - true если отправляем для предпросмотра, false - для отправки пикапа
*/

const toClient = [
  {
    ok: false,
    imei: ['Пример формата ошибки с бэка со статусом 4xx'],
  },
  {
    ok: true,
    result: {
      id: 172233,
      client: {},
      marketing: null,
      products: [],
    },
  },
]

module.exports = async (req, res) => {
  res.append('Content-Type', 'application/json')

  if (!req.is('multipart/form-data')) {
    return res.send(500).send({ ok: false, message: 'Is not multipart/form-data' })
  }

  const randIndex = getRandomInteger(0, 1)
  const toBeOrNotToBe = !!randIndex
  const base = toClient[randIndex]
  const response = {
    ...base,
    _service: {
      req: {
        params: req.params,
        query: req.query,
        body: req.body,
        fields: req.fields,
      },
    },
  }

  await delay(3000)

  return res.status(toBeOrNotToBe ? 200 : 400).send(response)
}
