import { Response as IResponse, NextFunction as INextFunction } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { TSPRequest } from '~/routers/smartprice/mws/report/v2/types'
import { getTimeDiff, getZero } from '~/utils/getTimeDiff'
import { getNumsReplacedToPlainText } from '~/utils/string-ops/getNumsReplacedToPlainText'

export const rules = {
  params: {
    body: {
      tradeinId: {
        type: 'number',
        descr: 'Trade-In ID',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case Number.isNaN(val):
              result.ok = false
              result.reason = `Should be number, received ${typeof val}`
              break
            default:
              break
          }
          return result
        }
      },
      limit: {
        type: 'number',
        descr: 'Количество обрабатываемых строк в Google Spreadsheet таблице',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }

          switch (true) {
            case Number.isNaN(val):
              result.ok = false
              result.reason = `Should be number, received ${typeof val}`
              break
            default:
              break
          }
          return result
        },
      }
    }
  }
}

const getRowsByTradeinId = ({ tradeinId, gRes }: { tradeinId: number, gRes: any }): any[] => {
  let result = []

  if (gRes.data?.values && Array.isArray(gRes.data.values)) result = gRes.data?.values.filter((row) => !!row[5] && row[5] === String(tradeinId))

  return result
}
type TMsg = {
  header: string;
  // body: string;
  details?: string;
  footer: string;
}
const getRowDetails = ({ row }): string => {
  const msgs: string[] = []
  try {
    const eventCode = row[2]
    switch (true) {
      // NOTE: Количество загруженных фото равно требуемому на загруженной странице
      case (eventCode === 'upload_ok'): {
        const photoType = row[3] // (uiErrText in table)
        switch (true) {
          case !!row[4] && !!row[8] && row[4] === row[8]:
            // NOTE: Загружено последнее фото
            msgs.push(`\t• ${photoType} (${row[4]} of ${row[8]})`)
            msgs.push('\t• ✅ Количество загруженных фото соответствует требуемому на загруженной странице')
            break
          case !!row[4] && !!row[8] && row[4] !== row[8]:
            // NOTE: Не последнее
            msgs.push(`\t• ${photoType} (${row[4]} of ${row[8]})`)
            break
          default:
            break
        }
        break
      }
      default:
        break
    }
  } catch (err) {
    console.log('- ERR: getAddSymbol')
    console.log(err)
  }
  return msgs.join('\n')
}

const getMarkdown = ({ rows }): string => {
  let msgs: TMsg[] = []
  let prevTimeDate = null
  const totalTtimeDiff = getTimeDiff({ startDate: new Date(rows[0][0]), finishDate: new Date(rows[rows.length - 1][0]) })
  const clientData: {
    uploadPage: {
      keys: Set<string>;
    },
    mainPage: {
      keys: Set<string>;
    },
  } = {
    uploadPage: {
      keys: new Set([]),
    },
    mainPage: {
      keys: new Set([]),
    },
  }
  const statusesForReloadsRegistration = {
    uploadPage: [
      'tradein_id_entered',
      'upload_ok',
      'upload_err',
    ],
    mainPage: [
      'accept_ok',
      'accept_err',
      'bought_device_err',
      'bought_device_ok',
      'mtsmain2023_personal',
      'mtsmain2023_upload_waiting_modal',
      'mtsmain2023_verified_ok',
      'status_bad_quality',
      'status_fake',
      'status_not_checked_started',
      'status_null',
      'status_ok',
    ],
  }
  const _fixReload = ({ row }): void => {
    const eventCode = row[2]
    const clientUniqueKey = row[1]
    try {
      switch (true) {
        case statusesForReloadsRegistration.mainPage.includes(eventCode):
          clientData.mainPage.keys.add(clientUniqueKey)
          break
        case statusesForReloadsRegistration.uploadPage.includes(eventCode):
          clientData.uploadPage.keys.add(clientUniqueKey)
          break
        default:
          break
      }
    } catch (err) {
      console.log('- ERR: _fixReload')
      console.log(err)
    }
  }

  for (let i = 0, max = rows.length; i < max; i++) {
    const row = rows[i]
    const msg: TMsg = {
      header: 'h:init:1',
      footer: 'f:init:1',
    }

    switch (i) {
      case 0: {
        msg.header = `${getNumsReplacedToPlainText(getZero(i + 1))} ${row[2]}`
        msg.footer = 'Начало анализа'

        const details = getRowDetails({ row })
        if (!!details) msg.details = details

        _fixReload({ row })
        break
      }
      default: {
        const date = new Date(row[0])
        const timeDiff = getTimeDiff({ startDate: prevTimeDate, finishDate: date })
        msg.header = `${getNumsReplacedToPlainText(getZero(i + 1))} ${row[2]}`
        msg.footer = timeDiff.message

        const details = getRowDetails({ row })
        if (!!details) msg.details = details

        _fixReload({ row })
        break
      }
    }
    prevTimeDate = new Date(row[0])

    msgs.push(msg)
  }

  let finalFormattedMsgs: TMsg[] = []
  if (msgs.length > 1) {
    for (let i = 0, max = msgs.length; i < max; i++) {
      const originalMsg = msgs[i]
      const msg: TMsg = {
        header: 'h:init:2',
        footer: '',
      }

      switch (true) {
        case i < max - 1: {
          const nextMsg = msgs[i + 1]
          
          msg.header = originalMsg.header
          msg.footer = `\t• Клиент ждет ${nextMsg.footer}`
          if (!!originalMsg.details) msg.details = originalMsg.details
          break
        }
        default:
          // LAST
          msg.header = originalMsg.header
          // msg.footer = '-> Конец анализа'
          if (!!originalMsg.details) msg.details = originalMsg.details
          break
      }

      finalFormattedMsgs.push(msg)
    }
  } else finalFormattedMsgs = [...msgs]

  return `${finalFormattedMsgs.map(({ header, footer, details }) => `\`${header}\`${!!details ? `\n${details}` : ''}${!!footer ? `\n${footer}` : ''}`).join('\n')}\n\nРезультат:\n\t- Общее время: \`${totalTtimeDiff.message}\`${!!clientData.uploadPage.keys.size ? `\n\t- UI загрузки фото: загружена ${clientData.uploadPage.keys.size} раз` : ''}${!!clientData.mainPage.keys.size ? `\n\t- Основной UI: загружена ${clientData.mainPage.keys.size} раз` : ''}`
}

export const getAnalysis = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  const { tradeinId, limit = 20000 } = req.body
  const maxLimit = 50000
  const _limit = limit > maxLimit ? maxLimit : limit

  let auth: any
  try {
    auth = req.smartprice.googleSheetsAuth
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  const client = await auth.getClient()
  const googleSheets = google.sheets({ version: 'v4', auth: client })
  const spreadsheetId = req.smartprice.spreadsheetId

  let gRes: any
  try {
    // Get metadata about spreadsheet
    // const metaData = await googleSheets.spreadsheets.get({
    //   auth,
    //   spreadsheetId,
    // })

    // Read rows from spreadsheet
    gRes = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      // range: "Sheet1!A:A",
      range: `/offline-tradein/upload-wizard!A2:M${_limit + 1}`,
    })

  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  const result: any = {
    ok: false,
  }
  if (!!gRes) {
    result.ok = true
    result.gRes = gRes
    result._service = {}
    if (result.gRes.data?.values) result._service.totalRowsLen = result.gRes.data.values.length

    const rowsForTradeInId = getRowsByTradeinId({ tradeinId, gRes })

    result._service.rowsForTradeInIdLen = rowsForTradeInId.length

    try {
      result.report = {
        md: getMarkdown({ rows: rowsForTradeInId })
      }
    } catch (err) {
      result.ok = false
      const errMsg = `Не удалось использовать getMarkdown: ${typeof err === 'string' ? err : (err.message || 'No err.message')}`
      result.message = errMsg
      result.report = {
        md: errMsg
      }
    }

    try {
      //const updatedRange = gRes.data?.updates?.updatedRange // NOTE: '/offline-tradein/upload-wizard'!A20:M20
      // const lastCell = updatedRange.split(':')[1]
      
      // -- NOTE: Example
      // var price = "£1,739.12";
      // parseFloat(price.replace( /[^\d\.]*/g, '')); // 1739.12

      // const lastRow = Number(lastCell.replace( /[^\d\.]*/g, ''))
      // result.id = lastRow
      // --
    } catch (err) {
      result.message = err.message || 'Не удалось распарсить до id'
    }
  }

  res.status(200).send(result)
  next()
}
