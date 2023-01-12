import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { THelp } from '~/utils/interfaces'
import { getCapitalizedFirstLetter } from '~/utils/getCapitalizedFirstLetter'
import { TSPRequest } from '~/routers/smartprice/mws/report/v2/types'

const maxLimit = 500
const _help: THelp = {
  params: {
    body: {
      limit: {
        type: 'number',
        descr: `Допустимый лимит по строкам (max ${maxLimit})`,
        required: false,
      },
      vendor: {
        type: 'string',
        descr: 'Производитель',
        required: false,
      },
      deviceType: {
        type: 'string',
        descr: 'Тип устройства',
        required: true,
      },
      isFreshOnly: {
        type: 'boolean',
        descr: 'Только из неиспользованных',
        required: false,
      },
    },
  },
}

const getRandomValue = ({ gRes, isFreshOnly }) => {
  let v = null
  let index = null
  if (!!gRes?.data?.values && Array.isArray(gRes?.data?.values)) {
    const allRows: any[][] = gRes.data.values.filter(r => !!r[0])

    if (allRows.length === 0) return { value: null, index: null }

    switch (true) {
      case isFreshOnly: {
        const possibleRows = allRows.filter((row) => {
          const hasUsedFlag = row.length === 2
          const alreadyUsed = Boolean(row[1])
          return hasUsedFlag ? !alreadyUsed : true
        })
        if (possibleRows.length === 0) {
          // NOTE: Take from bought devices?
          return { value: null, index: null }
        } else {
          index = Math.floor(Math.random() * possibleRows.length)
          const randRow = possibleRows[index]
          v = randRow[0]
        }
      }
        break
      default: {
        index = Math.floor(Math.random() * allRows.length)
        const randRow = allRows[index]

        v = randRow[0]
      }
        break
    }
  }
  return {
    value: v,
    index,
  }
}

const cfg = {
  mobile_phone: {
    Apple: ['C', 'D'],
    Samsung: ['A', 'B'],
  },
  smartwatch: {
    Apple: ['G', 'H'],
    Samsung: ['E', 'F'],
  }
}
const getColumnNames = ({ deviceType = 'mobile_phone', vendor = 'Samsung' }) => {
  const _modifiedVendor = getCapitalizedFirstLetter(vendor)
  // NOTE: Не поможет для случаев типа OnePlus!

  return cfg[deviceType][vendor] || cfg[deviceType][_modifiedVendor] || cfg[deviceType].Samsung
}

export const getRandom = async (req: TSPRequest, res: IResponse) => {
  const { limit = 5, vendor, deviceType, isFreshOnly } = req.body
  const modifiedLimit = limit <= maxLimit ? limit : maxLimit
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
    const columnNames = getColumnNames({ vendor, deviceType })
    gRes = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `/imei/usable!${columnNames[0]}4:${columnNames[1] || columnNames[0]}${3 + modifiedLimit}`,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ...result,
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  result.gRes = gRes

  const randomItemData = getRandomValue({ gRes, isFreshOnly })

  if (!!gRes?.data?.values) {
    result.ok = true
    result.value = randomItemData.value
    result.id = randomItemData.index
  } else {
    result.ok = false
    result.message = 'ERR: !!gRes?.data?.values is false'
  }

  res.status(200).send(result)
}
