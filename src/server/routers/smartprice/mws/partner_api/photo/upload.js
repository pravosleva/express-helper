/* eslint-disable import/extensions */
// @ts-ignore
import { getRandomInteger } from '../../../../../utils/getRandomInteger'

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    code: '_tmp_dev',
    message: '_dev_test',
  },
  {
    ok: true,
  },
]

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/photo/upload' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: */*' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'X-CSRFToken: 9e9VwWQEOVKiJ2cU8lbui5qmQSgyRw6awAqj7XXXmuN63zCDcWvBUp1ZnaQv81WO' -H 'X-Requested-With: XMLHttpRequest' -H 'Content-Type: multipart/form-data; boundary=---------------------------333018142925332316021065688076' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/upload/?sign=3eb45b0b98a49eeaed55609130a74b82&user=test_selling_point&timestamp=1617200521&id=114851' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-binary $'-----------------------------333018142925332316021065688076\r\nContent-Disposition: form-data; name="photo"; filename="xiaomi-mi6-back-side.jpg"\r\nContent-Type: image/jpeg\r\n\r\n-----------------------------333018142925332316021065688076\r\nContent-Disposition: form-data; name="id"\r\n\r\n114851\r\n-----------------------------333018142925332316021065688076\r\nContent-Disposition: form-data; name="type"\r\n\r\nback\r\n-----------------------------333018142925332316021065688076\r\nContent-Disposition: form-data; name="sign"\r\n\r\n3eb45b0b98a49eeaed55609130a74b82\r\n-----------------------------333018142925332316021065688076\r\nContent-Disposition: form-data; name="timestamp"\r\n\r\n1617200521\r\n-----------------------------333018142925332316021065688076\r\nContent-Disposition: form-data; name="user"\r\n\r\ntest_selling_point\r\n-----------------------------333018142925332316021065688076--\r\n'

export default async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
