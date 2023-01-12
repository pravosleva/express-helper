import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption } from '~/routers/smartprice/mws/report/v2/types'

export const sendReport = async (req: IRequest, res: IResponse) => {
  const { rowValues } = req.body

  if (!rowValues || !Array.isArray(rowValues)) return res.status(400).send({
    ok: false,
    message: `req.rowValues is ${typeof rowValues}; Should be array`
  })

  let auth: any
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: 'server-dist/routers/smartprice/mws/report/v2/credentials_console.cloud.google.com.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    })
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
  const spreadsheetId = '1NBXuyGlCznS0SJjJJX52vR3ZzqPAPM8LQPM_GX8T_Wc'

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
      insertDataOption: EInsertDataOption.OVERWRITE,
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
  if (!!gRes) result.gRes = gRes

  return res.status(200).send(result)
}
