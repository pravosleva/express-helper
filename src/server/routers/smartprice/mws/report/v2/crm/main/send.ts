import { Response as IResponse, NextFunction as INextFunction } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption, TSPRequest } from '~/routers/smartprice/mws/report/v2/types'
// import axios from 'axios'

export const rules = {
  params: {
    body: {
      rowValues: {
        type: '(string | number)[]',
        descr: 'Row values / props uiDate & ts will be added by server',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case !Array.isArray(val):
              result.ok = false
              result.reason = 'Should be array!'
              break
            case val.length === 0:
              result.ok = false
              result.reason = 'Len is zero. Why?'
              break
            default:
              break
          }
          return result
        }
      }
    }
  }
}

export const sendReport = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  const { rowValues } = req.body

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
  const date = new Date()
  const ts = date.getTime()
  const uiDate = date.toJSON()

  let gRes: any
  try {
    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: '/crm/main!A2',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: EInsertDataOption.INSERT_ROWS,
      requestBody: {
        values: [[uiDate, ts, ...rowValues]],
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

  // req.smartprice.report = {
  //   rowValues,
  //   resultId: result.id,
  //   ts,
  // }

  res.status(200).send(result)
  next()
}

// TODO
/*
export const spNotifyMW = async (req: TSPRequest, _res: IResponse, next: INextFunction) => {
  if (!!req.smartprice.report?.rowValues) {
    const rowValues = req.smartprice.report.rowValues
    const resultId = req.smartprice.report.resultId

    try {
      axios.post('https://pravosleva.ru/tg-bot-2021/notify/sp/offline-tradein/main/send', {
        chat_id: 432590698,
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
*/
