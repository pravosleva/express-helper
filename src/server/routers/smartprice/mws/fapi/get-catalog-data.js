// const { getRandomInteger } = require('utils/getRandomInteger')
// const fake = require('./fake')

module.exports = async (req, res) => {
  // const toBeOrNotToBe = getRandomInteger(0, 1)

  // res.status(200).send(String(getRandomInteger(500, 600)))

  // const result: IResult = {
  //   ok: false,
  //   _originalPath: req._parsedUrl.path,
  //   _loggerInfo: typeof req?.log,
  //   pagination: {
  //     total: 0,
  //     page: 1,
  //   },
  //   itemsData: {
  //     total: 0,
  //     list: [],
  //   },
  // };
  // const result = fake

  // result.itemsData.list.forEach((_item, i) => {
  //   result.itemsData.list[i].photo = result.itemsData.list[i].photo.replace('/static/', 'https://smartprice.ru/static/')
  // })

  res.status(200).send({})
  // res.status(toBeOrNotToBe ? 200 : 400).send({ ok: !!toBeOrNotToBe, _originalBody: req.body })
}
