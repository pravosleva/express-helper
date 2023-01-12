import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
// import { EInsertDataOption } from '~/routers/smartprice/mws/report/v2/types'

type TGameItem = { answer: string, question?: string }
const getItemsArr = ({ sheetData, validateRow }: { sheetData: string[][], validateRow: (_row: string[]) => boolean }) => {
  const result: TGameItem[] = []

  for (const row of sheetData) {
    if (!!validateRow(row)) {
      const newItem: TGameItem = { answer: row[0] }
      if (!!row[1]) newItem.question = row[1]

      result.push(newItem)
    }
  }

  return result
}

export const getItems = async (req: IRequest, res: IResponse) => {
  const { limit = 5 } = req.body
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
      range: `Viselitsa2023!A2:B${1 + modifiedLimit}`,
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
    result.items = getItemsArr({
      sheetData: gRes.data.values,
      validateRow: (row) => !!row[0].replace(' ', '')
    })
  } else {
    result.ok = false
    result.gRes = gRes
    result.message = 'In progress'
  }

  res.status(200).send(result)
}
