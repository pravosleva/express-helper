const delay = require('../../../../utils/delay')
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
// See also: https://github.com/expressjs/multer/blob/master/doc/README-ru.md

// https://t.ringeo.ru/issue/IT-1676
/*
Ручка: https://smartprice.ru/api/warranty_claim_email

Принимает POST-запрос с Content-Type: multipart/form-data.

Поля:

    type: обмен, возврат или ремонт;
    imei;
    warranty_card: номер гарантийного талона;
    client_phone: телефон;
    description: содержимое большой текстовой дырки;
    claim_file: один или более приложенных файлов.
*/

// const { getRandomInteger } = require('utils/getRandomInteger')

module.exports = async (req, res) => {
  res.append('Content-Type', 'application/json')

  if (!req.is('multipart/form-data')) {
    // Send error here
    // res.send(400);
    // console.log('IS NOT multipart/form-data')
  } else {
    // console.log('IS multipart/form-data')
    // Do logic here
  }

  // console.log(req.body)

  // const toBeOrNotToBe = getRandomInteger(0, 1)
  await delay(3000)
  res.status(200).send({ ok: true, _originalBody: req.body })
}
