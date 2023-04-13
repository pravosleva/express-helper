import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
// import { EInsertDataOption } from '~/routers/smartprice/mws/report/v2/types'

type TDictItem = {
  columnCode1: string;
  value1: string;
  columnCode2: string;
  value2: string;
  listLabel: string;
  id: string;
}
const getItemsArr = ({
  sheetData,
  validateRow,
}: {
  sheetData: string[][];
  validateRow: (_row: string[]) => boolean;
}): {
  dictVersion: string;
  rows: TDictItem[];
} => {
  const [firstRow, secondRow, ...restRows] = sheetData
  const result: TDictItem[] = []

  for (const row of restRows) {
    if (!row[0]) continue // Если первая клетка пуста
    if (!!validateRow(row)) {
      const newItem: TDictItem = {
        columnCode1: row[0],
        value1: row[1],
        columnCode2: row[2],
        value2: row[3],
        listLabel: row[4],
        id: row[5],
      }

      result.push(newItem)
    }
  }

  return {
    dictVersion: firstRow[5],
    rows: result
  }
}

export const getDict2 = async (req: IRequest, res: IResponse) => {
  const { limit = 1000 } = req.body
  const maxLimit = 500
  const modifiedLimit = limit <= maxLimit ? limit : maxLimit

  const result: any = {
    _originalBody: req.body,
  }

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

  // Get metadata about spreadsheet
  // const metaData = await googleSheets.spreadsheets.get({
  //   auth,
  //   spreadsheetId,
  // })

  // Write row(s) to spreadsheet
  let gRes: any

  // Read rows from spreadsheet
  try {
    gRes = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `/audit-helper-2023/get-dict-2!A1:F${2 + modifiedLimit}`,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ...result,
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  if (!!gRes?.data?.values) {
    console.log(gRes)
    result.ok = true
    result.gRes = gRes
    result._details = getItemsArr({
      sheetData: gRes.data.values,
      validateRow: (row) =>
        !!row[0]
        && !!row[1]
        && !!row[2]
        && !!row[3]
        && !!row[0].replace(' ', '')
        && !!row[1].replace(' ', '')
        && !!row[2].replace(' ', '')
        && !!row[3].replace(' ', '')
    })
  } else {
    result.ok = false
    result.gRes = gRes
    result.message = 'In progress'
  }

  res.status(200).send(result)
}
