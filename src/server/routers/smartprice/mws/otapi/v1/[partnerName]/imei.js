const { getRandomInteger } = require('~/utils/getRandomInteger')

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    code: 'imei_invalid',
    message: 'Неверный IMEI: Неверный формат IMEI',
    extra: null,
  },
  {
    ok: true,
    imei: '868030034494821',
    phone: {
      vendor: 'Xiaomi',
      model: 'MI 6',
      memory: '',
      color: '',
      memory_choices: ['128 GB', '64 GB'],
      color_choices: {
        '128 GB': ['white', 'ceramic_black', 'blue', 'black'],
        '64 GB': ['black', 'blue', 'ceramic_black', 'white'],
      },
      type: 'mobile_phone',
    },
    id: 777,
    photo: 'models/samsung/galaxy-s20-ultra/color_cosmic_black_01.jpg',
  },
  {
    ok: true,
    imei: '868030034494821',
    phone: {
      vendor: 'Xiaomi',
      model: 'MI 6',
      memory: '128 GB',
      color: 'black',
      type: 'mobile_phone',
    },
    id: 777,
    photo: 'models/samsung/galaxy-s20-ultra/color_cosmic_black_01.jpg',
  },
]

module.exports = (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(1, 2)

  res.status(200).send({
    ...toClient[toBeOrNotToBe],
    imei: req.body.IMEI,
    _originalBody: req.body,
  })
}
