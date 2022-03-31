// const { getRandomInteger } = require('utils/getRandomInteger')
const delay = require('../../../../../utils/delay')

module.exports = async (req, res) => {
  res.append('Content-Type', 'application/json')

  let filter

  try {
    filter = req.body.filter
  } catch (err) {
    res.status(500).send({ ok: false, _originalBody: req.body })
  }

  // const toBeOrNotToBe = getRandomInteger(0, 1)

  const sample = [
    {
      id: 141974,
      city: 'Питерка, Саратовская обл. - [КУРЬЕР, 3 - 6 раб.дн.] - 100руб.',
      price: 100,
    },
    {
      id: 141976,
      city: 'Питерское, Тамбовская обл. - [КУРЬЕР, 4 - 7 раб.дн.] - 200руб.',
      price: 200,
    },
    {
      id: 141975,
      city: 'Питеркино, Чувашия респ. - [КУРЬЕР, 3 - 6 раб.дн.] - 300руб.',
      price: 300,
    },
    {
      id: 136978,
      city: 'Козловка, Питерский р-н, Саратовская обл. - [КУРЬЕР, 3 - 6 раб.дн.] - 400руб.',
      price: 400,
    },
    {
      id: 139963,
      city: 'Нива, Питерский р-н, Саратовская обл. - [КУРЬЕР, 4 - 7 раб.дн.] - 500руб.',
      price: 500,
    },
    {
      id: 100157,
      city: 'Белгород - [ПУНКТ ВЫДАЧИ, 1-2 раб.дн.] - 300руб.',
      price: 300,
    },
  ]

  const items = []

  sample.forEach((item) => {
    if (item.city.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
      items.push(item)
    }
  })

  await delay(2000)

  // res.status(toBeOrNotToBe ? 200 : 400).send(items)
  res.status(200).send(items)
}
