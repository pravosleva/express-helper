// @ts-ignore
// import { getRandomInteger } from '../../../../../../utils/getRandomInteger'
import kzSuccess2022 from '~/routers/smartprice/mws/partner_api/tradein/fake-data/kz-2022.0.phone_check.json'
import { THelp } from '~/utils/express-validation/interfaces'

// const { SUCCESS_ANYWAY } = process.env

export const rules: THelp = {
  params: {
    body: {
      color: {
        type: 'string',
        descr: 'Device color',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.color shoud be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      memory: {
        type: 'string',
        descr: 'Device memory',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.memory shoud be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      },
      IMEI: {
        type: 'string',
        descr: 'Device IMEI',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.body.IMEI shoud be not empty string'
              break
            // TODO: Others...
            default:
              break
          }
          return result
        }
      }
    }
  }
}

const toClient = [
  {
    ok: false,
    code: '_tmp_dev',
    message: '_dev_test',
  },
  {
    ok: true,
    currency: 'RUB',
    price: 100,
    id: 777, // 114851,
    condition: 'NC',
    sp_condition: 'n_grade_best',
    nine_photos_mode: 'lite',
    subsidies: [],
    sim_check_enabled: false,
  },
]

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/tradein/phone/check' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: */*' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'X-SP-WebUI: 1' -H 'X-CSRFToken: HCKhOJSlzBKBUTKQ7YH9TZO1dMBtpiZy4Y1FpKZE7aNpeqazbz1gvjpEK4bqGNPc' -H 'X-Requested-With: XMLHttpRequest' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw 'IMEI=359514067075843&diag_display_broken=1&memory=8 GB'

export const partnerApiTradeInPhoneCheck = async (req, res) => {
  const toBeOrNotToBe = 1 // SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  /* REQ SAMPLE:
  {
    "IMEI": "359514067075843",
    "diag_display_broken": "1",
    "memory": "8 GB"
  }
  */

  if (req.body.kz_2022) {
    return res.status(200).send({
      ...kzSuccess2022,
      _originalBody: req.body,
    })
  }

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
