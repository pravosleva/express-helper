// const { getRandomInteger } = require('../../../../../../utils/getRandomInteger')
const delay = require('../../../../../../utils/delay')

// const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: true,
    hubs: ['rtk_hubnovosib', 'sulpak_hub'],
    couriers: {
      rubakov: {
        sn: 'Rubakov',
        objectClass: 'smartpricePerson',
        cn: 'rubakov',
        ou: ['admins', 'int'],
        mail: '',
        mobile: 'None',
        pager: '2',
        givenName: '\u0420\u0443\u0431\u0430\u043a\u043e\u0432 \u0421\u0435\u0440\u0433\u0435\u0439',
      },
      cdek: {
        ou: ['couriers', 'int'],
        givenName: '\u0421\u0414\u042d\u041a',
        displayName: '\u0421\u0414\u042d\u041a',
        sn: '\u0421\u0414\u042d\u041a',
        cn: 'cdek',
        title: 'male',
        ignoreReceiptClosed: '1',
        objectClass: 'smartpricePerson',
        isCdek: '1',
        memberOf: ['couriers'],
      },
    },
  },
]

module.exports = async (req, res) => {
  res.append('Content-Type', 'application/json')

  // TODO: if !delivery -> 403 поле delivery обязательно

  // const toBeOrNotToBe = SUCCESS_ANYWAY === '1' ? 1 : Boolean(getRandomInteger(0, 1))
  const response = {
    ...toClient[0],
  }

  // res.status(toBeOrNotToBe ? 200 : 400).send(response)

  await delay(3000)

  res.status(200).send(response)
}
