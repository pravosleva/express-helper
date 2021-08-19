// import axios from 'axios'
import request from 'request'

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_PRAVOSLEVA_2021

const getTGPath = (fileName: string) => `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/documents/${fileName}`

// https://api.telegram.org/file/bot962430073:AAGiTIIaB8yMUdV1_3ORDleWyh449QeIObc/documents/file_26.png

export const getFileShadow = async (req, res) => {
  const { file_name } = req.params

  if (!file_name) {
    return res.status(401).send({
      success: false,
      _originalParams: { params: req.params },
    })
  }

  try {
    // V1:
    // const tgResponse = await axios.get(getTGPath(file_name))
    // console.log(tgResponse.data)

    // V2:
    return request(getTGPath(file_name)).pipe(res);

    /* V3:
    res.writeHead(200, {
        'Content-Type': mimetype,
        'Content-disposition': 'attachment;filename=' + filename,
        'Content-Length': data.length
    });
    res.end(Buffer.from(data, 'binary'));
    */
  } catch (err) {
    console.log('--- ERR')
    console.log(err)
    return res.status(500).send({
      success: false,
      message: err.message || 'No err.message',
      _originalParams: { params: req.params },
    })
  }
}
