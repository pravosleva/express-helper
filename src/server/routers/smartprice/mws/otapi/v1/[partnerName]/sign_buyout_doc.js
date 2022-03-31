const { getRandomInteger } = require('../../../../../../utils/getRandomInteger')

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    code: 'bad_sms_code',
    message: 'Неверный код из СМС',
    extra: null,
  },
  {
    ok: true,
  },
]

/* Body sample:
{
	"code": "1233"
}
*/

module.exports = async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
