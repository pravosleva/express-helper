import { getRandomInteger } from '~/utils/getRandomInteger'
import { THelp } from '~/utils/interfaces'

// const { SUCCESS_ANYWAY } = process.env

const _help: THelp = {
  params: {
    body: {
      // IMEI: {
      //   type: 'string',
      //   descr: 'IMEI сдаваемого устройства',
      //   required: true,
      // },
      // bought_imei: {
      //   type: 'string[]',
      //   descr: 'IMEI приобретаемого устройства',
      //   required: true,
      // },
      odd_success: {
        type: 'number',
        descr: 'Число запросов, кратно которому ответ будет успешным',
        required: false,
      },
      random_success: {
        type: 'boolean',
        descr: 'Успешный ответ либо нет',
        required: false,
      },
      _bought_device_title: {
        type: 'string',
        descr: 'Какое значение вернуть в subsidies.title в успешном ответе',
        required: false,
      },
    },
  },
}

const toClient = [
  {
    ok: false,
    code: "no_device",
    message: "Неизвестное устройство",
    extra: null
  },
  {
    ok: true,
    subsidy: {
      // title: 'Samsung Galaxy Watch 4 40mm' // С нулевым price
      title: 'Samsung Galaxy Watch 4 Classic 42mm',
      price: 1000,
    },
  },
]

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/tradein/phone/check' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: */*' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'X-SP-WebUI: 1' -H 'X-CSRFToken: HCKhOJSlzBKBUTKQ7YH9TZO1dMBtpiZy4Y1FpKZE7aNpeqazbz1gvjpEK4bqGNPc' -H 'X-Requested-With: XMLHttpRequest' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw 'IMEI=359514067075843&diag_display_broken=1&memory=8 GB'

export const boughtDevice = async (req, res) => {
  /* REQ SAMPLE:
  {
    "IMEI": "359514067075843", //
    "bought_imei": ["123"],
  } */

  const errs: string[] = []
  for (const key in _help.params.body) {
    if (_help.params.body[key]?.required && !req.body[key]) {
      errs.push(`Missing required param: \`${key}\` (${_help.params.body[key].descr})`)
    }
  }
  if (errs.length > 0)
    return res.status(200).send({
      ok: false,
      message: `ERR! ${errs.join('; ')}`,
      _originalBody: req.body,
      _help,
    })

  const toBeOrNotToBe = 1 // SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)
  const { _bought_device_title } = req.body
  const result = {
    ...toClient[toBeOrNotToBe],
    _originalBody: req.body,
  }

  if (!!toBeOrNotToBe && !!_bought_device_title) result.subsidy.title = _bought_device_title

  return setTimeout(() => {
    res.status(200).send(result)
  }, 2000)
}
