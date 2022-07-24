/* eslint-disable no-restricted-syntax */
// const { getRandomInteger } = require('utils/getRandomInteger')
// const { SUCCESS_ANYWAY } = process.env

const requiredFields = {
  // birth_date: true,
  // email: true,
  first_name: true,
  // id_address: true,
  // id_city: true,
  // id_date_of_issue: true,
  // id_issued_by: true,
  // id_issuing_agency_code: true,
  // id_number: true,
  // id_serial_number: true,
  // id_type: true,
  last_name: true,
  // patronymic: true,
  phone: true,
}

const toClient = [
  {
    ok: false,
    code: 'bad_request',
    message: 'Неверные параметры запроса',
    extra: null,
  },
  {
    ok: true,
  },
]

/* Body sample:
{
	"birth_date": "13.04.1988",
	"email": "123@123.ru",
	"first_name": "Den",
	"id_address": "Lubyanka 1",
	"id_city": "Moscow",
	"id_date_of_issue": "10.10.2008",
	"id_issued_by": "Moscow cop",
	"id_issuing_agency_code": "123-333",
	"id_number": "123412",
	"id_serial_number": "4607",
	"id_type": "passport",
	"last_name": "Pol",
	"patronymic": "Vla",
	"phone": "+7(916)123-1231"
}
*/

module.exports = async (req, res) => {
  let toBeOrNotToBeIndex = 0
  const internalErrorResult = {
    ok: true,
  }

  if (Object.keys(req.body).length === 0) {
    internalErrorResult.ok = false
    internalErrorResult.code = 'bad_request'
    internalErrorResult.message = 'Ни одного поля не найдено'
  } else {
    // noEmptyFields
    for (const key in requiredFields) {
      if (requiredFields[key] && !req.body[key]) {
        // Обязательное поле из нот детектед
        internalErrorResult.ok = false
        internalErrorResult.code = 'bad_request'
        if (!internalErrorResult.message) {
          internalErrorResult.message = `Errored fields detected: ${key}`
        } else {
          internalErrorResult.message += `, ${key}`
        }
      }
    }

    // toBeOrNotToBeIndex = SUCCESS_ANYWAY === '1' ? 1 : getRandomInteger(0, 1)
    if (internalErrorResult.ok) {
      toBeOrNotToBeIndex = 1
    }
  }

  const result = toClient[toBeOrNotToBeIndex]

  setTimeout(() => {
    res.status(200).send({
      ...result,
      ...internalErrorResult,
      _originalBody: req.body,
    })
  }, 500)
}
