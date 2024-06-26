// import { getRandomInteger } from '~/utils/getRandomInteger'

// const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    message: 'Пожалуйста, отвяжите Find My iPhone',
  },
  {
    ok: true,
  },
]

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/tradein/phone/check' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: */*' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'X-SP-WebUI: 1' -H 'X-CSRFToken: HCKhOJSlzBKBUTKQ7YH9TZO1dMBtpiZy4Y1FpKZE7aNpeqazbz1gvjpEK4bqGNPc' -H 'X-Requested-With: XMLHttpRequest' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw 'IMEI=359514067075843&diag_display_broken=1&memory=8 GB'

export const checkFMIP = async (req, res) => {
  /* REQ SAMPLE:
  {
    "imei": "359514067075843",
    "retailer_personnel_number": "123",
  } */

  if (!req.body.imei) {
    return res.status(200).send({
      ok: false,
      message: 'Required fields in req: imei',
      _originalBody: req.body,
    })
  }

  if (req.body.is_errored) {
    return res.status(200).send({
      ...toClient[0],
      _originalBody: req.body,
    })
  }

  const toBeOrNotToBe = 1 // SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  return setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 5000)
}
