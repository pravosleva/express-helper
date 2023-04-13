import { Response as IResponse, NextFunction as INextFunction } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption, TSPRequest } from '~/routers/smartprice/mws/report/v2/types'
import axios from 'axios'

// const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

export const sendReport = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  const { rowValues: _rowValues } = req.body
  const date = new Date()
  const rowValues = [date.toJSON(), ..._rowValues]

  if (!rowValues || !Array.isArray(rowValues)) return res.status(400).send({
    ok: false,
    message: `req.rowValues is ${typeof rowValues}; Should be array`
  })

  let auth: any
  try {
    auth = req.smartprice.googleSheetsAuth
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  const client = await auth.getClient()
  const googleSheets = google.sheets({ version: 'v4', auth: client })
  const spreadsheetId = req.smartprice.spreadsheetId

  let gRes: any
  try {
    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: '/offline-tradein/upload-wizard!A2',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: EInsertDataOption.INSERT_ROWS,
      requestBody: {
        values: [rowValues],
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  const result: any = {
    ok: true,
  }
  if (!!gRes) {
    result.gRes = gRes

    try {
      const updatedRange = gRes.data?.updates?.updatedRange // NOTE: '/offline-tradein/upload-wizard'!A20:M20
      const lastCell = updatedRange.split(':')[1]
      // var price = "£1,739.12";
      // parseFloat(price.replace( /[^\d\.]*/g, '')); // 1739.12

      const lastRow = Number(lastCell.replace( /[^\d\.]*/g, ''))
      result.id = lastRow
    } catch (err) {
      result.message = err.message || 'Не удалось распарсить до id'
    }
  }

  req.smartprice.report = {
    rowValues,
    resultId: result.id,
  }

  res.status(200).send(result)
  next()
}

export const spNotifyMW = async (req: TSPRequest, _res: IResponse, next: INextFunction) => {
  if (!!req.smartprice.report?.rowValues) {
    const rowValues = req.smartprice.report.rowValues
    const resultId = req.smartprice.report.resultId

    try {
      axios.post('http://pravosleva.ru/tg-bot-2021/sp-notify/offline-tradein/upload-wizard/send', {
        // chat_id: 432590698,
        chat_id: isProd ? -1001615277747 : 432590698,
        rowValues,
        resultId,
        ts: new Date().getTime(),
      })
    } catch (err) {
      console.log(err)
    }
  }
  else next()
  
  next()
}
