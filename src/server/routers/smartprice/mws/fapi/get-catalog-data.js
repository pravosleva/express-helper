// const { getRandomInteger } = require('utils/getRandomInteger')
// const fake = require('./fake')

const fakeDeviceList = [
  {
    variantId: 5671,
    uniqueKey: 5671,
    economyValue: 50001,
    vendor: 'Apple',
    model: 'Apple iPhone 5S',
    smartPriceOutput: 59999,
    memory: '16 GB',
    // photo: '/static/img/smartprice/models/sony/xperia-1/01.jpg',
    photo: 'https://i2.stat01.com/1/5355/53549237/afacdb/telefon-apple-iphone-5s-16gb-silver-lte.jpg',
    colors: ['gray', 'black', 'purple', 'white'],
    productType: 'mobile_phone',
    link: '/product/Apple_5s_used?color=white&memory=128%20GB&condition=works',
    pricelist: { like_new: 31202, works: 59999, best: 90000 },
    isMultHidden: false,
    productId: 777777,
  },
  {
    variantId: 4848,
    uniqueKey: 4848,
    economyValue: 25156,
    vendor: 'Sony',
    model: 'Xperia 1',
    smartPriceOutput: 27121,
    memory: '128 GB',
    // photo: '/static/img/smartprice/models/sony/xperia-1/01.jpg',
    photo:
      'https://www.mytrendyphone.eu/images2/Sony-Xperia-Z1-LCD-Display-og-touch-glas-reparation-black-02042014-1-p.jpg',
    colors: ['gray', 'black', 'purple', 'white'],
    productType: 'mobile_phone',
    link: '/product/Sony_Xperia-1_used?color=white&memory=128%20GB&condition=works',
    pricelist: { like_new: 31202, works: 27121, best: 29365 },
    isMultHidden: false,
    productId: 816,
  },
  {
    variantId: 4841,
    uniqueKey: 4841,
    economyValue: 22680,
    vendor: 'Sony',
    model: 'Xperia 1',
    smartPriceOutput: 24470,
    memory: '64 GB',
    // photo: '/static/img/smartprice/models/sony/xperia-1/01.jpg',
    photo:
      'https://www.mytrendyphone.eu/images2/Sony-Xperia-Z1-LCD-Display-og-touch-glas-reparation-black-02042014-1-p.jpg',
    colors: ['black', 'gray', 'purple', 'white'],
    productType: 'mobile_phone',
    link: '/product/Sony_Xperia-1_used?color=black&memory=64%20GB&condition=works',
    pricelist: { like_new: 28142, works: 24470, best: 26408 },
    isMultHidden: false,
    productId: 816,
  },
]

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

  const result = {
    ok: true,
    _originalPath: '/get-catalog-data?page=1&sort=price%3Adesc&sale=true&vendor=Sony',
    _aboutLogger: 'object',
    pagination: { total: 1, page: 1 },
    itemsData: {
      total: fakeDeviceList.length,
      list: fakeDeviceList,
    },
  }

  res.status(200).send(result)
  // res.status(toBeOrNotToBe ? 200 : 400).send({ ok: !!toBeOrNotToBe, _originalBody: req.body })
}
