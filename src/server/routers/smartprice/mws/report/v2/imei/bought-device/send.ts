import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { THelp } from '~/utils/interfaces'
import { EInsertDataOption } from '../../types'
import { TSPRequest } from '~/routers/smartprice/mws/report/v2/types'

const _help: THelp = {
  params: {
    body: {
      deviceType: {
        type: 'string',
        descr: 'Тип устройства',
        required: true,
      },
      value: {
        type: 'string',
        descr: 'IMEI or S/N',
        required: true,
      },
    },
  },
}

const cfg: {[key: string]: { rowIndex: number }} = {
  mobile_phone: {
    // column: 'B',
    rowIndex: 0,
  },
  smartwatch: {
    // column: 'C',
    rowIndex: 1,
  },
}
const getColumnData = ({ deviceType = 'mobile_phone' }) => cfg[deviceType]

export const sendBoughtDevice = async (req: TSPRequest, res: IResponse) => {
  // const maxLimit = 200
  const { deviceType, value } = req.body
  const result: any = {
    _originalBody: req.body,
    _help,
  }
  
  const errs: string[] = []
  for (const key in _help.params.body) {
    if (_help.params.body[key]?.required && !req.body[key]) {
      errs.push(`Missing required param: \`${key}\` (${_help.params.body[key].descr})`)
    }
  }

  if (!cfg[deviceType]) {
    errs.push(`INCORRECT param: \`deviceType\` (possible values: ${Object.keys(cfg).join(', ')})`)
  }

  if (errs.length > 0)
    return res.status(200).send({
      ...result,
      ok: false,
      message: `ERR! ${errs.join('; ')}`,
    })
  
  let auth: any
  
  try {
    auth = req.smartprice.googleSheetsAuth
  } catch (err) {
    return res.status(500).send({
      ...result,
      ok: false,
      message: err.message || 'No err.message',
    })
  }

  const client = await auth.getClient()

  const googleSheets = google.sheets({ version: 'v4', auth: client })
  const spreadsheetId = req.smartprice.spreadsheetId

  let gRes: any
  try {
    // Read rows from spreadsheet
    const { rowIndex } = getColumnData({ deviceType })
    const row: any[] = []
    // NOTE: Init empty row
    for (let i = 0, max = Object.keys(cfg).length; i < max; i++) row[i] = ''

    row[rowIndex] = value

    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      // The [A1 notation](/sheets/api/guides/concepts#cell) of the values to update.
      range: '/imei/bought-device!A2', // :C${maxLimit}
      valueInputOption: 'USER_ENTERED',
      insertDataOption: EInsertDataOption.OVERWRITE,
      requestBody: {
        values: [row],
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ...result,
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  if (!!gRes?.data?.updates) {
    result.ok = true
    result.gRes = gRes
  } else {
    result.ok = false
    result.gRes = gRes
    result.message = 'ERR: !!gRes?.data?.values is false'
  }

  res.status(200).send(result)
}
