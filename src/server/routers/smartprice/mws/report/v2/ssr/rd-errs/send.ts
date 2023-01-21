import { Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption, TSPRequest } from '~/routers/smartprice/mws/report/v2/types'

export const sendReport = async (req: TSPRequest, res: IResponse) => {
  const { rowValues } = req.body

  if (!rowValues || !Array.isArray(rowValues)) return res.status(400).send({
    ok: false,
    message: `req.rowValues is ${typeof rowValues}; Should be array`
  })

  let auth: any
  try {
    auth = req.smartprice.googleSheetsAuth
  } catch (err) {
    console.log(err)
    return res.status(500).send({
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

  return res.status(200).send(result)
}
