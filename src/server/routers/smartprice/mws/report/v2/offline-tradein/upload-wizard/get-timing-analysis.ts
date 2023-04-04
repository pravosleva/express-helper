import { Response as IResponse, NextFunction as INextFunction } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { TSPRequest } from '~/routers/smartprice/mws/report/v2/types'
import { getTimeDiff, getZero } from '~/utils/getTimeDiff'

const getRowsByTradeinId = ({ tradeinId, gRes }: { tradeinId: number, gRes: any }): any[] => {
  let result = []

  if (gRes.data?.values && Array.isArray(gRes.data.values)) result = gRes.data?.values.filter((row) => !!row[5] && row[5] === String(tradeinId))

  return result
}
type TMsg = {
  header: string;
  body: string;
  details?: string;
}
const getRowDetails = ({ row }): string => {
  let result = ''
  try {
    const eventCode = row[2]
    switch (true) {
      // NOTE: Количество загруженных фото равно требуемому на загруженной странице
      case (eventCode === 'upload_ok' && !!row[4] && !!row[8] && row[4] === row[8]):
        result = `✅ Количество загруженных фото равно требуемому на загруженной странице (${row[8]})`
        break
      default:
        break
    }
  } catch (err) {
    console.log('- ERR: getAddSymbol')
  }
  return result
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
    uploadPage: ['upload_ok', 'upload_err'],
    mainPage: ['status_ok', 'status_fake', 'status_bad_quality', 'status_null', 'status_not_checked_started'],
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
      header: 'h',
      body: 'b',
    }

    switch (i) {
      case 0: {
        msg.header = `${getZero(i + 1)}. ${row[2]}`
        msg.body = 'Начало анализа'

        const details = getRowDetails({ row })
        if (!!details) msg.details = details

        _fixReload({ row })
        break
      }
      default: {
        const date = new Date(row[0])
        const timeDiff = getTimeDiff({ startDate: prevTimeDate, finishDate: date })
        msg.header = `${getZero(i + 1)}. ${row[2]}`
        msg.body = timeDiff.message

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
        header: 'h',
        body: 'b',
      }

      switch (true) {
        case i < max - 1: {
          const nextMsg = msgs[i + 1]
          
          msg.header = originalMsg.header
          msg.body = `-> ${nextMsg.body}`
          if (!!originalMsg.details) msg.details = originalMsg.details
          break
        }
        default:
          // LAST
          msg.header = originalMsg.header
          msg.body = '' // `-> Конец анализа`
          if (!!originalMsg.details) msg.details = originalMsg.details
          break
      }

      finalFormattedMsgs.push(msg)
    }
  } else finalFormattedMsgs = [...msgs]

  return `${finalFormattedMsgs.map(({ header, body, details }) => `\`${header}${!!body ? ` ${body}` : ''}\`${!!details ? `\n\t${details}` : ''}`).join('\n')}\n\nРезультат:\n\t- Общее время: \`${totalTtimeDiff.message}\`${!!clientData.uploadPage.keys.size ? `\n\t- UI загрузки фото: загружена ${clientData.uploadPage.keys.size} раз` : ''}${!!clientData.mainPage.keys.size ? `\n\t- Основной UI: загружена ${clientData.mainPage.keys.size} раз` : ''}`
}

export const getAnalysis = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  const { tradeinId, limit = 20000 } = req.body
  const maxLimit = 50000
  const _limit = limit > maxLimit ? maxLimit : limit

  if (!tradeinId) return res.status(400).send({
    ok: false,
    message: `req.tradeinId is ${typeof tradeinId}; Should be number`
  })

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
