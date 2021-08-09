/* eslint-disable prefer-destructuring */
// const { getRandomInteger } = require('../../../../../../utils/getRandomInteger')
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
    imei: ['Пример формата ошибки с бэка'],
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

// NOTE: По идее нужно делать как при назначении вывоза, то есть обновлять список пикапов исходя из этих данных.
// Тут id - это номер пикапа, cdek_dispatch_number - номер накладной сдэк

module.exports = async (req, res) => {
  res.append('Content-Type', 'application/json')

  if (!req.is('multipart/form-data')) {
    return res.send(500).send({ ok: false, message: 'Is not multipart/form-data' })
  }

  // if (req.fields.dry_run !== true || req.fields.dry_run !== false) {
  //   res.status(500).send({ ok: false, message: 'Обязательное поле: req.body.dry_run' })
  // }

  // const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : Boolean(getRandomInteger(0, 1))
  const base = toClient[1]

  const response = {
    ...base,
    _originalBody: { body: req.body, fields: req.fields },
  }

  // res.status(toBeOrNotToBe ? 200 : 400).send(response)

  await delay(3000)

  return res.status(200).send(response)
}
