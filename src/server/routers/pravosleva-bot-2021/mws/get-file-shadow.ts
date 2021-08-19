import request from 'request'

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_PRAVOSLEVA_2021

const getTGPath = (fileName: string) => `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/documents/${fileName}`

export const getFileShadow = async (req, res) => {
  const { file_name } = req.params

  if (!file_name) {
    return res.status(401).send({
      success: false,
      _originalParams: { params: req.params },
    })
  }

  try {
    return request(getTGPath(file_name)).pipe(res);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || 'No err.message',
      _originalParams: { params: req.params },
    })
  }
}
