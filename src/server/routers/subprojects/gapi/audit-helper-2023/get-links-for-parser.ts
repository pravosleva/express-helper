import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
// import { EInsertDataOption } from '~/routers/smartprice/mws/report/v2/types'

type TDictItem = {
  link: string;
}
const getItemsArr = ({
  sheetData,
  validateRow,
}: {
  sheetData: string[][];
  validateRow: (_row: string[]) => boolean;
}): {
  rows: TDictItem[];
} => {
  const [firstRow, ...restRows] = sheetData
  const result: TDictItem[] = []

  for (const row of restRows) {
    if (!row[0]) continue // Если первая клетка пуста
    if (!!validateRow(row)) {
      const newItem: TDictItem = {
        link: row[0],
      }

      result.push(newItem)
    }
  }

  return {
    rows: result
  }
}

export const getLinksForParser = async (req: IRequest, res: IResponse) => {
  const { limit = 1000 } = req.body
  const maxLimit = 10000
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
      range: `/audit-helper-2023/pages-4-pasring!A1:A${2 + modifiedLimit}`,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ...result,
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  const preparedData = getItemsArr({
    sheetData: gRes.data.values,
    validateRow: (row) => !!row[0]
  })
  if (!!gRes?.data?.values) {
    result.ok = true
    result.gRes = gRes
    result._details = preparedData
    result.links = preparedData.rows.map(({ link }) => link)
  } else {
    result.ok = false
    result.gRes = gRes
    result.message = 'In progress'
  }

  res.status(200).send(result)
}
