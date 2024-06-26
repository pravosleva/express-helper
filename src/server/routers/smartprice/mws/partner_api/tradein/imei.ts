// @ts-ignore
// import { getRandomInteger } from '~/utils/getRandomInteger'
import { THelp } from '~/utils/interfaces'
import kzSuccess2022 from './fake-data/kz-2023.0-dev-exp.imei.json'
import { mutateObject } from '~/utils/mutateObject'

// const { SUCCESS_ANYWAY } = process.env

// const toClient: any[] = [
//   {
//     ok: false,
//     code: 'no_device',
//     message: 'Неизвестное устройство',
//     extra: null,
//   },
//   {
//     ok: true,
//     phone: {
//       vendor: 'Samsung',
//       type: 'tablet',
//       model: 'Galaxy Tab E 9.6 3G',
//       memory: '',
//       memory_choices: ['8 GB'],
//       color: 'white',
//       find_my_iphone: '',
//     },
//     imei: '359514067075843',
//     currency: 'RUB',
//     possible_prices: {
//       C: {
//         '8 GB': {
//           white: 1860,
//         },
//       },
//       D: {
//         '8 GB': {
//           white: 999,
//         },
//       },
//       NC: {
//         '8 GB': {
//           white: 100,
//         },
//       },
//     },
//     possible_subsidies: [],
//     photo: null,
//     id: 777, // 114851,
//     show_warning: false,
//     raw_data: '{"Color": "WHITE", "Memory": "None_8GB", "Model": "SM-T561NZWASER", "ModelName": "Galaxy Tab E 9.6"}',
//   },
// ]
const _help: THelp = {
  params: {
    body: {
      IMEI: {
        type: 'string',
        descr: 'IMEI',
        required: true,
      },
      buyout_mode: {
        type: 'string',
        descr: 'Тип выкупа',
        required: false,
      },
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
    },
  },
}
const toClient = [
  {
    ok: false,
    message: 'Tst err from express-helper',
  },
  {
    ok: true,
    phone: {
      vendor: 'Samsung',
      model: 'Galaxy S10 plus',

      // vendor: 'Apple',
      // model: 'iPhone 13',

      type: 'mobile_phone',
      memory: '',
      memory_choices: ['512 GB', '128 GB', '1024 GB'],
      color: '',
      color_choices: {
        '512 GB': [
          'canary_yellow',
          'cardinal_red',
        ],
        '128 GB': [
          'ceramic_white',
          'ceramic_black',
        ],
        '1024 GB': [
          'prism_white',
          'prism_green',
          'prism_blue',
          'prism_black',
          'flamingo_pink',
        ],
      },
      find_my_iphone: '',
    },
    imei: '354809101735914',
    currency: 'RUB',
    possible_prices: {
      C: {
        '512 GB': {
          canary_yellow: 15695,
          cardinal_red: 15695,
          ceramic_black: 15695,
          ceramic_white: 15695,
          flamingo_pink: 15695,
          prism_black: 15695,
          prism_blue: 15695,
          prism_green: 15695,
          prism_white: 15695,
        },
        '128 GB': {
          prism_white: 12999,
          prism_green: 12999,
          prism_blue: 12999,
          prism_black: 12999,
          flamingo_pink: 12999,
          ceramic_white: 12999,
          ceramic_black: 12999,
          cardinal_red: 12999,
          canary_yellow: 12999,
        },
        '1024 GB': {
          prism_white: 17194,
          prism_green: 17194,
          prism_blue: 17194,
          prism_black: 17194,
          flamingo_pink: 17194,
          ceramic_white: 17194,
          ceramic_black: 17194,
          cardinal_red: 17194,
          canary_yellow: 17194,
        },
      },
      D: {
        '512 GB': {
          canary_yellow: 13000,
          cardinal_red: 13000,
          ceramic_black: 13000,
          ceramic_white: 13000,
          flamingo_pink: 13000,
          prism_black: 13000,
          prism_blue: 13000,
          prism_green: 13000,
          prism_white: 13000,
        },
        '128 GB': {
          prism_white: 10999,
          prism_green: 10999,
          prism_blue: 10999,
          prism_black: 10999,
          flamingo_pink: 10999,
          ceramic_white: 10999,
          ceramic_black: 10999,
          cardinal_red: 10999,
          canary_yellow: 10999,
        },
        '1024 GB': {
          prism_white: 14500,
          prism_green: 14500,
          prism_blue: 14500,
          prism_black: 14500,
          flamingo_pink: 14500,
          ceramic_white: 14500,
          ceramic_black: 14500,
          cardinal_red: 14500,
          canary_yellow: 14500,
        },
      },
      NC: {
        '512 GB': {
          canary_yellow: 5000,
          cardinal_red: 5000,
          ceramic_black: 5000,
          ceramic_white: 5000,
          flamingo_pink: 5000,
          prism_black: 5000,
          prism_blue: 5000,
          prism_green: 5000,
          prism_white: 5000,
        },
        '128 GB': {
          prism_white: 4499,
          prism_green: 4499,
          prism_blue: 4499,
          prism_black: 4499,
          flamingo_pink: 4499,
          ceramic_white: 4499,
          ceramic_black: 4499,
          cardinal_red: 4499,
          canary_yellow: 4499,
        },
        '1024 GB': {
          prism_white: 5500,
          prism_green: 5500,
          prism_blue: 5500,
          prism_black: 5500,
          flamingo_pink: 5500,
          ceramic_white: 5500,
          ceramic_black: 5500,
          cardinal_red: 5500,
          canary_yellow: 5500,
        },
      },
    },
    possible_subsidies: [],
    photo: null,
    id: 115288,
    show_warning: false,
    raw_data:
      '{"refcode":"05072022082737","responsestatus":"success","deviceid":"354809101735914","partnerid":"SmartPrice","branchid":"RUS","recordidentifier":"1657024050.4169106-devreqid","blackliststatus":"No","greyliststatus":"No","imeihistory":[{"action":"NA","date":"NA","by":"NA","Country":"NA"}],"manufacturer":"Samsung Korea","brandname":"Samsung","marketingname":"Galaxy S10+","modelname":"SM-G975F","band":"CA_2,CA_3,CA_7,CA_38,CA_40,CA_41,CA_1A-3A,CA_1A-5A,CA_1A-7A,CA_1A-8A,CA_1A-20A,CA_1A-28A,CA_1A-40A,CA_2A-12A,CA_3C-5A,CA_3A-7A,CA_3A-7A-7A,CA_3C-7A,CA_3C-7C,CA_3A-8A,CA_3A-3A-8A,CA_3A-20A,CA_3C-20A,CA_3A-28A,CA_3A-38A,CA_3A-40A,CA_3A-40C,CA_3A-41A,CA_4A-7A,CA_4A-12A,CA_4A-17A,CA_5A-7A,CA_5A-40A,CA_7A-8A,CA_7A-20A,CA_7B-28A,CA_7C-28A,CA_20A-38A,CA_38A-40A,CA_2A-2A,CA_3A-3A,CA_4A-4A,CA_7A-7A,CA_40A-40A,CA_41A-41C,CA_66A-66A,CA_1A-3A-5A,CA_1A-3A-7A,CA_1A-3C-7A,CA_1A-3A-8A,CA_1A-3A-20A,CA_1A-3A-28A,CA_1A-7A-20A,CA_1A-7A-28A,CA_3A-5A-40A,CA_3A-7A-8A,CA_3A-7A-20A,CA_3A-7A-28A,CA_3A-20A-32A,CA_1A-3A-7A-20A,LTE FDD BAND 1,LTE FDD BAND 2,LTE FDD BAND 3,LTE FDD BAND 4,LTE FDD BAND 5,LTE FDD BAND 7,LTE FDD BAND 8,LTE FDD BAND 12,LTE FDD BAND 13,LTE FDD BAND 17,LTE FDD BAND 18,LTE FDD BAND 19,LTE FDD BAND 20,LTE FDD BAND 25,LTE FDD BAND 26,LTE FDD BAND 28,LTE FDD Band 66,LTE TDD BAND 38,LTE TDD BAND 39,LTE TDD BAND 40,LTE TDD BAND 41,GSM 1800,GSM 1900,GSM850 (GSM800),GSM 900,WCDMA FDD Band 1,WCDMA FDD Band 2,WCDMA FDD Band 4,WCDMA FDD Band 5,WCDMA FDD Band 8,WCDMA TDD Band A","operatingsys":"Android","nfc":"Yes","bluetooth":"Yes","WLAN":"Yes","devicetype":"Smartphone"}',
    analytics_session_id: 123,
    seconds_since_analytics_session_started: '2022-09-15T13:06+03:00',
  },
]

export default async (req, res) => {
  const errs: string[] = []
  const { memory_value, color_value, vendor_value, kz_2022, _err_tst, _add_data } = req.body

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

  let toBeOrNotToBe = !!_err_tst ? 0 : 1 // SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)
  let result: any = {
    ...toClient[toBeOrNotToBe],
  }

  if (!!toBeOrNotToBe) {
    if (kz_2022) result = kzSuccess2022
    if (!!color_value) {
      result.phone.color = color_value
    } else {
      result.phone.color = ''
    }
    if (!!memory_value) {
      result.phone.memory = memory_value
    } else {
      result.phone.memory = ''
    }
    if (!!vendor_value) result.phone.vendor = vendor_value
  }

  const adds = {
    imei: req.body.IMEI,
    _originalBody: req.body,
  }

  result = { ...result, ...adds }

  if (!!_add_data && typeof _add_data === 'object' && Object.keys(_add_data).length > 0)
    mutateObject({ target: result, source: _add_data })

  setTimeout(() => {
    res.status(200).send(result)
  }, 1000)
}
