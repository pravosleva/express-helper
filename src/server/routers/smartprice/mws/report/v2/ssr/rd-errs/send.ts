import { Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption, TSPRequest } from '~/routers/smartprice/mws/report/v2/types'
import { TValidationResult } from '~/utils/express-validation'

const expectedPropsLenTotal = 13

const userAgentIgnoreList = [
  'Python/3.8 aiohttp/3.8.1', // NOTE: Предположительно, чей-то скрипт
  'Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)', // NOTE: Majestic; https://www.mj12bot.com/
  'Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot; help@moz.com)',
]

// TODO:
// const userAgentIgnoreContract = /^(MJ12bot).|Mozilla\/5.0 (compatible; MJ12bot\/v1.4.8; http:\/\/mj12bot.com\/)|Python\/3.8 aiohttp\/3.8.1/;

export const rules = {
  params: {
    body: {
      rowValues: {
        type: '(string | number)[]',
        descr: 'Значения столбцов в новой строке таблицы',
        required: true,
        validate: (val: any) => {
          const result: TValidationResult = {
            ok: true,
          }
          
          switch (true) {
            case !Array.isArray(val):
              result.ok = false
              result.reason = 'req.body.rowValues should be array! (в этом случае uiData добавляет отправитель)'
              break
            case val.length === 0:
              result.ok = false
              result.reason = 'req.body.rowValues.length is zero (why?)'
              break
            case val.length !== expectedPropsLenTotal:
              result.ok = false
              result.reason = `Expected len should be ${expectedPropsLenTotal}. Received: ${val.length} (why?)`
              break
            // NOTE: Check user-agent value in event
            case userAgentIgnoreList.includes(val[12]):
              result.ok = false
              result.reason = `user-agent (req.body.rowValues[12]) exists in ignore list. Received: ${val[12]}`
              break
            default:
              break
          }
          result._reponseDetails = {
            status: 200,
          }
          return result
        }
      }
    }
  }
}

export const sendReport = async (req: TSPRequest, res: IResponse) => {
  const { rowValues } = req.body

  let auth: any
  try {
    auth = req.smartprice.googleSheetsAuth
  } catch (err) {
    console.log(err)
    return res.status(200).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  // Create client instance for auth
  const client = await auth.getClient()

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: 'v4', auth: client })
  const spreadsheetId = req.smartprice.spreadsheetId

  // Get metadata about spreadsheet
  // const metaData = await googleSheets.spreadsheets.get({
  //   auth,
  //   spreadsheetId,
  // })

  // Read rows from spreadsheet
  // const getRows = await googleSheets.spreadsheets.values.get({
  //   auth,
  //   spreadsheetId,
  //   range: "Sheet1!A:A",
  // })

  // Write row(s) to spreadsheet
  let gRes: any
  try {
    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: '/ssr/rd-errs!A2',
      valueInputOption: 'USER_ENTERED',

      // NOTE: Legacy param?
      // resource: { values: [[insertDataOption, 'h']], },

      // -- NOTE: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append#InsertDataOption
      insertDataOption: EInsertDataOption.INSERT_ROWS,
      // --

      requestBody: {
        values: [rowValues],
      },
    })
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: `By Google: ${err.message || 'No err.message'}`
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

  return res.status(200).send(result)
}
