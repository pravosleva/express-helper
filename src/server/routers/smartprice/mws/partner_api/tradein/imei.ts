// @ts-ignore
import { getRandomInteger } from '../../../../../utils/getRandomInteger'

const { SUCCESS_ANYWAY } = process.env

const toClient: any[] = [
  {
    ok: false,
    code: 'no_device',
    message: 'Неизвестное устройство',
    extra: null,
  },
  {
    ok: true,
    phone: {
      vendor: 'Samsung',
      type: 'tablet',
      model: 'Galaxy Tab E 9.6 3G',
      memory: '',
      memory_choices: ['8 GB'],
      color: 'white',
      find_my_iphone: '',
    },
    imei: '359514067075843',
    currency: 'RUB',
    possible_prices: {
      C: {
        '8 GB': {
          white: 1860,
        },
      },
      D: {
        '8 GB': {
          white: 999,
        },
      },
      NC: {
        '8 GB': {
          white: 100,
        },
      },
    },
    possible_subsidies: [],
    photo: null,
    id: 777, // 114851,
    show_warning: false,
    raw_data: '{"Color": "WHITE", "Memory": "None_8GB", "Model": "SM-T561NZWASER", "ModelName": "Galaxy Tab E 9.6"}',
  },
]

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/tradein/imei' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: */*' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'X-SP-WebUI: 1' -H 'X-CSRFToken: HCKhOJSlzBKBUTKQ7YH9TZO1dMBtpiZy4Y1FpKZE7aNpeqazbz1gvjpEK4bqGNPc' -H 'X-Requested-With: XMLHttpRequest' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw 'IMEI=359514067075843'

export default async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      imei: req.body.IMEI,
      _originalBody: req.body,
    })
  }, 500)
}
