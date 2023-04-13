import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption } from '~/routers/smartprice/mws/report/v2/types'

type TResStruct = {
  ok: boolean;
  message?: string;
  gRes?: any;
  _details?: {
    [key: string]: any;
  };
  id?: number;
}

export const mainReport = async (req: IRequest, res: IResponse) => {
  const result: TResStruct = {
    ok: false,
    gRes: null,
    _details: {
      _originalBody: req.body,
    },
  }

  const { rowValues } = req.body
  if (!rowValues || !Array.isArray(rowValues)) return res.status(400).send({
    ok: false,
    message: `req.rowValues is ${typeof rowValues}; Should be array`
  })

  let auth: any
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: 'server-dist/routers/subprojects/gapi/credentials_console.cloud.google.com.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ...result,
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  // Create client instance for auth
  const client = await auth.getClient()

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: 'v4', auth: client })
  const spreadsheetId = '1W4zNhgtbVyZr8Sh9ge37zAzlIVpRBahh6O2w3vepYi8'
  const date = new Date()
  const ts = date.getTime()
  const uiDate = date.toJSON()

  let gRes: any
  try {
    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: '/audit-helper-2023/main-report!A3',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: EInsertDataOption.INSERT_ROWS,
      requestBody: {
        values: [[uiDate, ...rowValues]],
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  if (!!gRes) {
    result.ok = true
    result.gRes = gRes

    try {
      const updatedRange = gRes.data?.updates?.updatedRange
      const lastCell = updatedRange.split(':')[1]

      const lastRow = Number(lastCell.replace( /[^\d\.]*/g, ''))
      result.id = lastRow
    } catch (err) {
      result.message = err.message || 'Не удалось распарсить до id'
    }
  }

  if (!!gRes?.data?.values) {
    console.log(gRes)
    result.ok = true
    result.gRes = gRes
  } else {
    result.ok = false
    result.gRes = gRes
    result.message = `gRes?.data?.values is ${typeof !gRes?.data?.values}`
  }

  res.status(200).send(result)
}
