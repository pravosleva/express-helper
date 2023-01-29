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
        required: true,
      },
      deviceType: {
        type: 'string',
        descr: 'Тип устройства',
        required: true,
      },
      isFreshOnly: {
        type: 'boolean',
        descr: 'Только из неиспользованных (видимо, с незагруженными фото)',
        required: false,
      },
    },
  },
}
const tableOffset = 4

const getRandomValue = ({ gRes, isFreshOnly }) => {
  let v: string | null = null
  let index: number | null = null
  let report: any[] = []
  let possibleIndexes: number[] = []

  if (!!gRes?.data?.values && Array.isArray(gRes?.data?.values)) {
    const allRows: any[][] = gRes.data.values // .filter(r => !!r[0])

    if (allRows.length === 0) return {
      value: null,
      index: null,
    }

    switch (true) {
      case isFreshOnly: {
        possibleIndexes = []
        for (let i = 0, max = allRows.length; i < max; i++) {
          // const hasUsedFlag = allRows[i].length === 2
          const alreadyUsed = !!allRows[i][1] && (allRows[i][1] === 'ИСТИНА' || allRows[i][1] === 'TRUE')
          report.push(`${i + tableOffset}: alreadyUsed= ${alreadyUsed}`)
          if (!alreadyUsed) possibleIndexes.push(i)
        }

        if (possibleIndexes.length === 0) return {
          value: null,
          index: null,
          service: {
            report,
          },
          message: 'Вероятно, доступные IMEI закончились'
        }

        index = possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)]

        const randRow = allRows[index]
        v = randRow[0]
        break
      }
      default: {
        index = Math.floor(Math.random() * allRows.length)
        const randRow = allRows[index]

        v = randRow[0]
        break
      }
    }
  }

  if (!index) 

  return {
    value: v,
    index: index + tableOffset, // NOTE: Строки начинаются с 1 + три строки в шапке
    service: {
      report,
      tableOffset,
      possibleIndexes,
    },
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
const getColumnNames = ({ deviceType, vendor }) => {
  if (!cfg[deviceType]) return null

  const _modifiedVendor = getCapitalizedFirstLetter(vendor)
  // NOTE: Не поможет для случаев типа OnePlus!

  return cfg[deviceType][vendor] || cfg[deviceType][_modifiedVendor] || null
}

export const getRandom = async (req: TSPRequest, res: IResponse) => {
  const { limit = 10, vendor, deviceType, isFreshOnly } = req.body
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

    if (!columnNames) throw new Error(`Не предусмотрено для кейса: ${deviceType} ${vendor}`)

    gRes = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `/imei/usable!${columnNames[0]}${tableOffset}:${columnNames[1] || columnNames[0]}${(tableOffset - 1) + modifiedLimit}`,
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

  if (!randomItemData.index) {
    result.ok = false
    result.message = randomItemData.message || 'Не удалось получить IMEI из таблицы'
  } else if (!!gRes?.data?.values) {
    result.ok = true
    result.value = randomItemData.value
    result.id = randomItemData.index
  } else {
    result.ok = false
    result.message = `!!gRes?.data?.values is ${JSON.stringify(gRes?.data?.values)}`
  }

  result._service = {
    getRandomValue: randomItemData
  }

  res.status(200).send(result)
}
