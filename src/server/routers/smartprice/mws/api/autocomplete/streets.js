const { getRandomInteger } = require('../../../../../utils/getRandomInteger')
// const delay = require('utils/delay')

module.exports = async (req, res) => {
  res.append('Content-Type', 'application/json')

  let filter

  try {
    filter = req.body.filter
  } catch (err) {
    res.status(500).send({ ok: false, _originalBody: req.body, message: err.message || 'No err.message' })
  }

  const toBeOrNotToBe = getRandomInteger(0, 1)

  const sample = [
    'Питерка ж/д_ст',
    'Питерская дор',
    'Питерский 1-й проезд',
    'Питерский Лужок ул',
    'Питерка ст',
    'Питеркинское с/п',
    'Питерский 3-й проезд',
    'Питерский кв-л',
    'Питерский р-н',
    'Питерский пр-д',
    'Питерское МО тер',
    'Питерка с',
    'Питерское с',
    'Питер с',
    'Питер д',
    'Питеренка снт',
    'Питерского ул',
    'Питерский 2-й проезд',
    'Питеримка д',
    'Питерский пер',
    'Питерская ул',
    'Питерский пр-кт',
    'Питеркино д',
    'Питерская 3-я ул',
    'Питеренка тер. СНТ',
    'Марии Питериной ул',
    '2 Питерка ул',
    'Кордон Питерская Вершина нп',
    'СНП Питеренка тер.',
    '1 Питерка ул',
    '1-Питерская ул',
    '2-Питерская ул',
    'Старо-Питерская ул',
    '1-й Питерский пр-д',
    '1-я Питерка ул',
    '3-й Питерский проезд',
    'имени Олега Питерянинова ул',
    '2-й Питерский проезд',
    '2-я Питерка ул',
    '1-й Питерский п',
    'ул. Белгородский пр., 110',
  ]

  const items = []

  sample.forEach((item) => {
    if (item.toLowerCase().includes(filter.toLowerCase())) {
      items.push(item)
    }
  })

  // await delay(1000)

  res.status(toBeOrNotToBe ? 200 : 400).send(items)
}
