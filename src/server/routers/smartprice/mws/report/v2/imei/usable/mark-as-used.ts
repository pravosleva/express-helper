import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { THelp } from '~/utils/interfaces'
import { getCapitalizedFirstLetter } from '~/utils/getCapitalizedFirstLetter'
import { EInsertDataOption, TSPRequest } from '~/routers/smartprice/mws/report/v2/types'

const _help: THelp = {
  params: {
    body: {
      imei: {
        type: 'string',
        descr: 'Значение IMEI (для подтверждения перед изменением в таблице)',
        required: true,
      },
      id: {
        type: 'number',
        descr: 'Строка в таблице Google sheets',
        required: true,
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
    },
  },
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

export const markAsUsed = async (req: TSPRequest, res: IResponse) => {
  const { vendor, deviceType, id, imei } = req.body
  // const modifiedLimit = limit <= maxLimit ? limit : maxLimit
  const result: any = {
    //_originalBody: req.body,
    // _help,
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
  let gStateMutationRes: any

  try {
    const columnNames = getColumnNames({ vendor, deviceType })

    if (!columnNames) throw new Error(`Не предусмотрено для кейса: ${deviceType} ${vendor}`)

    gRes = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `/imei/usable!${columnNames[0]}${id}:${columnNames[1] || columnNames[0]}${id}`,
    })
    const gRows = gRes?.data?.values
    if (!gRows) throw new Error(`Скорее всего нет IMEI с таким id; Unknown case: gRes?.data?.values is ${JSON.stringify(gRes?.data?.values)}`)

    const targetRow = gRows[0]

    switch (true) {
      case columnNames.length === 1:
        throw new Error('Столбец не предназначен для дополнительной отметки')
      case targetRow.length === 2 && (targetRow[1] === "ИСТИНА" || targetRow[1] === "TRUE"):
        return res.status(200).send({
          ...result,
          ok: true,
          message: 'Already used',
          gRes: gRes || null,
          gStateMutationRes: gStateMutationRes || null,
        })
      case targetRow.length === 2 && !!targetRow[1]:
        throw new Error(`Unknown case: targetRow is ${JSON.stringify(targetRow)}`)
      case targetRow[0] !== imei:
        throw new Error(`Возможно, таблица уже изменена. Текущее значение для этого id: ${targetRow[0]}`)
      case targetRow.length === 1:
        // -- TODO: Mutate

        // const allRows: any[][] = gRes?.data?.values?.filter(r => !!r[0])

        gStateMutationRes = await googleSheets.spreadsheets.values.append({
          auth,
          spreadsheetId,
          // The [A1 notation](/sheets/api/guides/concepts#cell) of the values to update.
          range: `/imei/usable!${columnNames[1]}${id}:${columnNames[1]}${id}`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: EInsertDataOption.OVERWRITE,
          requestBody: {
            values: [["true"]],
          },
        })

        // --
        break
      default: throw new Error(`Row does not exists or has another mark? targetRow is ${JSON.stringify(targetRow)}`)
    }
  } catch (err) {
    console.log(err)
    return res.status(200).send({
      ...result,
      ok: false,
      message: err.message || 'No err.message',
      gRes: gRes || null,
      gStateMutationRes: gStateMutationRes || null,
    })
  }

  result.gRes = gRes

  if (!!gRes?.data?.values) {
    result.ok = true
    // result.id = id
    result.gRows = gRes?.data?.values
  } else {
    result.ok = false
    result.message = `ERR: !!gRes?.data?.values is ${JSON.stringify(gRes?.data?.values)}`
  }

  res.status(200).send(result)
}
