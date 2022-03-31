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

const toClient = {
  dry_run: [
    // dry_run == true - отдаём список устройств для предварительного просмотра
    {
      ok: true,
      result: [
        {
          state: 'success',
          scheduled_date: '2021-05-11',
          courier: 'cdek',
          id: 15361,
          is_cdek: true,
          cdek_dispatch_number: '1234567890',
          priority: 3,
        },
      ],
    },
    // dry_run == false - такой же ответ как при назначении вызова по кнопке из
    // "Управление заявками на вывоз trade-in", по запросу PUT /api/crm/tradeins/pickup/batch/
    {
      ok: true,
      package_ids: ['1245135', '1245136', '1245137'],
      products: [
        {
          imei: '354021080294067',
          package_id: '1245135',
          name: 'Samsung Galaxy A5 2017 black_sky 32 GB',
        },
        {
          imei: '355766078354161',
          package_id: '1245136',
          name: 'Apple iPhone 6S rose_gold 16 GB',
        },
      ],
    },
  ],
}

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
  let base
  if (req.fields.dry_run === 'true') {
    base = toClient.dry_run[1]
  } else {
    base = toClient.dry_run[0]
  }
  const response = {
    ...base,
    _originalBody: { body: req.body, fields: req.fields },
  }

  // res.status(toBeOrNotToBe ? 200 : 400).send(response)

  await delay(3000)

  return res.status(200).send(response)
}
