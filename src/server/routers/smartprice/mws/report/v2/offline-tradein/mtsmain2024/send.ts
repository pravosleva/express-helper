import { Response as IResponse, NextFunction as INextFunction } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption, TSPRequest } from '~/routers/smartprice/mws/report/v2/types'
import axios from 'axios'
import { Counter } from '~/utils/Counter'
import { NEvent } from './types'

const counter = Counter()

const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''
// const isDev = process.env.NODE_ENV === 'development'
// const isProd = process.env.NODE_ENV === 'production'

// const expectedPropsLenTotal: number = 12

export const rules = {
  params: {
    body: {
      uniquePageLoadKey: {
        type: 'string',
        descr: 'Page load key',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case !val:
              result.ok = false
              result.reason = `Should be not empty string, received ${typeof val}`
              break
            default:
              break
          }
          return result
        }
      },
      uniqueUserDataLoadKey: {
        type: 'string',
        descr: 'User data load key',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case !val:
              result.ok = false
              result.reason = `Should be not empty string, received ${typeof val}`
              break
            default:
              break
          }
          return result
        }
      },
      tradeinId: {
        type: 'number',
        descr: 'Trade-In ID',
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
        }
      },
      room: {
        type: 'string',
        descr: 'Room name',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      appVersion: {
        type: 'string',
        descr: 'Application version',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      metrixEventType: {
        type: 'string',
        descr: 'Event type',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      eventCode: {
        type: 'string',
        descr: 'Event code (for Google Sheet)',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      reportType: {
        type: 'string',
        descr: 'Report type',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            case !Object.values(NEvent.EReportType).includes(val):
              result.ok = false
              result.reason = `Possible values: ${Object.values(NEvent.EReportType).join(', ')}`
              break
            default:
              break
          }
          return result
        }
      },
      stateValue: {
        type: 'string',
        descr: 'State name value (See stepMachine)',
        required: true,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      stepDetails: {
        type: 'object',
        descr: 'Step Details as JSON',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case !val:
              result.ok = false
              result.reason = `Should be an object, received ${String(val)} (${typeof val})`
              break
            case typeof val !== 'object':
              result.ok = false
              result.reason = `Should be an object, received ${typeof val}`
              break
            default:
              break
          }
          return result
        }
      },
      imei: {
        type: 'string',
        descr: 'IMEI value',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      gitSHA1: {
        type: 'string',
        descr: 'GIT SHA1 repo value',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      specialClientKey: {
        type: 'string',
        descr: 'Client data set',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            case !val:
              result.ok = false
              result.reason = 'Should be not empty string'
              break
            default:
              break
          }
          return result
        }
      },
      ip: {
        type: 'string',
        descr: 'IP adress',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            // case !val:
            //   result.ok = false
            //   result.reason = 'Should be not empty string'
            //   break
            default:
              break
          }
          return result
        }
      },
      userAgent: {
        type: 'string',
        descr: 'user-agent (could be taken from req headers)',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            // case !val:
            //   result.ok = false
            //   result.reason = 'Should be not empty string'
            //   break
            default:
              break
          }
          return result
        }
      },
      clientReferer: {
        type: 'string',
        descr: 'clientReferer (could be taken from socket.handshake.headers.referer)',
        required: false,
        validate: (val: any) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = {
            ok: true,
          }
          
          switch (true) {
            case typeof val !== 'string':
              result.ok = false
              result.reason = `Should be string, received ${typeof val}`
              break
            // case !val:
            //   result.ok = false
            //   result.reason = 'Should be not empty string'
            //   break
            default:
              break
          }
          return result
        }
      },
      // TODO?
      // _wService?: {
      //   _perfInfo: {
      //     tsList: TPerfInfoItem[];
      //   };
      // };
    }
  }
}

export const sendReport = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  const {
    tradeinId, ts, imei, room, appVersion, metrixEventType, reportType,
    stateValue, stepDetails, eventCode, uniquePageLoadKey, uniqueUserDataLoadKey,
    gitSHA1,
    // specialClientKey,
    ip,
    userAgent, clientReferer,
    // _wService,
  } = req.body

  const ignoreStateValuesForGoogleSheetReport = [
    'sm:app-init',
    'sm:check-fmip',
    'sm:upload-photo:in-progress',
  ]
  if (ignoreStateValuesForGoogleSheetReport.includes(stateValue)) {
    return res.status(200).send({
      ok: false,
      message: 'Report declined'
    })
  }

  const date = new Date()
  const rowValues = [date.toJSON()]

  rowValues.push(ts)
  rowValues.push(reportType)
  rowValues.push(!!imei ? String(imei) : '')
  rowValues.push(appVersion)
  rowValues.push(tradeinId || '')
  rowValues.push(stateValue)
  rowValues.push(JSON.stringify(stepDetails))
  rowValues.push(room)
  rowValues.push(uniquePageLoadKey)
  rowValues.push(uniqueUserDataLoadKey)
  rowValues.push(metrixEventType)
  rowValues.push(eventCode)
  rowValues.push(gitSHA1)
  rowValues.push(userAgent)
  rowValues.push(ip)
  rowValues.push(clientReferer)

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
    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: '/offline-tradein/mtsmain2024!A3',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: EInsertDataOption.INSERT_ROWS,
      requestBody: {
        values: [rowValues],
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  const result: {
    id: number;
    ok: boolean;
    message?: string;
    gRes?: any;
  } = {
    id: 0,
    ok: true,
  }
  if (!!gRes) {
    result.gRes = gRes

    try {
      const updatedRange = gRes.data?.updates?.updatedRange // NOTE: '/offline-tradein/upload-wizard'!A20:M20
      const lastCell = updatedRange.split(':')[1]
      // var price = "£1,739.12";
      // parseFloat(price.replace( /[^\d\.]*/g, '')); // 1739.12

      const lastRow = Number(lastCell.replace( /[^\d\.]*/g, ''))
      result.id = lastRow
    } catch (err) {
      result.message = err.message || 'Не удалось распарсить до id'
      result.id = counter.next().value || new Date().getTime()
    }
  } else {
    result.id = counter.next().value || new Date().getTime()
    result.message = '!gRes #wtf0'
  }

  req.smartprice.report = {
    rowValues,
    resultId: result.id,
    ts,
  }

  res.status(200).send(result)
  next()
}

export const spNotifyMW = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  if (!tgBotApiUrl) next()

  if (!!req.smartprice.report?.rowValues) {
    const rowValues = req.smartprice.report.rowValues

    if (!Array.isArray(rowValues) || !rowValues.length) next()

    const resultId = req.smartprice.report.resultId

    const metrixEventTypesForTelegramNotifs = [
      'sp-mx:offline-tradein:c:event',
      'sp-xhr-history:offline-tradein:c:report', // NOTE: Deprecated 
      'sp-history:offline-tradein:c:report',
    ]
    const stateValuesForCorpTelegramNotifs = [
      // 'sm:enter-imei',
      'sm:act-print',
    ]
    
    const [
      _uiDate,
      _ts,
      _reportType,
      imei,
      appVersion,
      tradeinId,
      stateValue,
      stepDetailsJSON,
      _room,
      _uniquePageLoadKey,
      _uniqueUserDataLoadKey,
      metrixEventType,
      _eventCode,
      gitSHA1,
      userAgent,
      ip,
      clientReferer,
    ] = req.smartprice.report.rowValues

    // const timeZone = 'Europe/Moscow'
    // const uiDate = new Date(ts).toLocaleString('ru-RU', { timeZone })
    // NOTE: See also https://stackoverflow.com/a/54453990

    const targetMDMsgs = []
    if (!!stepDetailsJSON) {
      try {
        const _parsed = JSON.parse(stepDetailsJSON)
        targetMDMsgs.push(`\`\`\`json\n${JSON.stringify(_parsed, null, 2)}\`\`\``)
      } catch (err) {
        targetMDMsgs.push(`⚠️ Не удалось распарсить stepDetails: ${err.message || 'No message'}`)
      }
    }
    // targetMDMsgs.push(`${uiDate} (${timeZone})`)

    // -- NOTE: Temporal solution
    // try {
    //   if (!specialClientKey) throw new Error('Client wasnt detected')

    //   const parsedClientDataArr = specialClientKey.replace(/_/g, ' ').split('//')
    //   const clientDataNotes = []

    //   if (parsedClientDataArr.length > 0) {
    //     for (const str of parsedClientDataArr) {
    //       if (!!str) clientDataNotes.push(str)
    //     }
    //     if (clientDataNotes.length > 0) targetMDMsgs.push(clientDataNotes.join('\n'))
    //   } else throw new Error('Не удалось определить данные клиента')
    // } catch (err) {
    //   targetMDMsgs.push(err.message || 'Incorrect client data')
    // }

    try {
      if (!userAgent) throw new Error('user-agent wasnt detected')

      targetMDMsgs.push(userAgent.replace(/_/g, ' '))
    } catch (err) {
      targetMDMsgs.push(err.message || 'Incorrect client data')
    }
    // --

    const _tagsSectionMsgs = []
    if (!!imei) _tagsSectionMsgs.push(`#imei${imei}`)
    if (!!tradeinId) _tagsSectionMsgs.push(`#tradein${tradeinId}`)

    if (_tagsSectionMsgs.length > 0) targetMDMsgs.push(_tagsSectionMsgs.join('\n'))

    try {
      const TG_CHATS: {
        [key: string]: {
          chat_id: number;
          // TODO: thread?
        };
      } ={
        SPDevs: {
          chat_id: -1001615277747,
        },
        Pravosleva: {
          chat_id: 432590698,
        },
      }
      let targetChatSettings: {
        chat_id: number;
        // TODO: thread?
      } = TG_CHATS.Pravosleva

      const opts = {
        resultId,
        // chat_id: 432590698,
        chat_id: -1001615277747,
        ts: req.smartprice.report.ts || new Date().getTime(),
        eventCode: 'aux_service',
        // -- NOTE: Possible values
        // export enum EEventCodes {
        //   MAGAZ_REMINDER_DAILY = 'magaz_reminder_daily',
        //   MAGAZ_REMINDER_WEEKLY = 'magaz_reminder_weekly',
        //   MAGAZ_SPRINT_REMINDER_WEEKLY = 'magaz_sprint_reminder_weekly',
        //   MAGAZ_REMINDER_MONTHLY = 'magaz_reminder_monthly',
        //   SP_REMINDER_DAILY = 'sp_reminder_daily',
        //   SP_REMINDER_WEEKLY = 'sp_reminder_weekly',
        //   TASKLIST_REMINDER_DAILY = 'tasklist_reminder_daily',
        //   AUX_SERVICE = 'aux_service',
        //   SINGLE_REMINDER = 'single_reminder',
        // }
        // --
        about: [
          `SP Offline Trade-In #report${resultId}`,
          `*${stateValue}*`,
          '',
          `\`\`\`\nIP: ${ip || 'No'}\nClient app version: ${appVersion || 'No'}\nIMEI: ${imei || 'No'}\nGIT SHA1: ${gitSHA1 || 'No'}\`\`\``,
        ].join('\n'),
        targetMD: targetMDMsgs.join('\n\n'),
      }

      // NOTE: Check level 1
      switch (true) {
        case metrixEventTypesForTelegramNotifs.includes(metrixEventType):
          switch (metrixEventType) {
            case 'sp-mx:offline-tradein:c:event':
              // NOTE: Check level 2
              switch (true) {
                case stateValuesForCorpTelegramNotifs.includes(stateValue):
                  targetChatSettings = TG_CHATS.SPDevs
                  // NOTE: Go on...
                  break
                default:
                  throw new Error(`Отправка stateValue в TG чат не предусмотрена: ${stateValue}`)
              }
              break
            case 'sp-xhr-history:offline-tradein:c:report': // NOTE: Deprecated
            case 'sp-history:offline-tradein:c:report':
              targetChatSettings = TG_CHATS.Pravosleva
              opts.about = [
                `⚠️ SP Offline Trade-In #report${resultId} (sent by user)`,
                `*${stateValue}*`,
                '',
                `\`\`\`\nIP: ${ip || 'No'}\nClient app version: ${appVersion || 'No'}\nIMEI: ${imei || 'No'}\nGIT SHA1: ${gitSHA1 || 'No'}\nClient referer: ${clientReferer || 'No'}\`\`\``,
              ].join('\n')
              break
            default:
              // NOTE: Go on?
              break
          }
          break
        default:
          throw new Error(`Отправка metrixEventType в TG чат не предусмотрена: ${metrixEventType}`)
      }

      // NTOE: Final
      for (const key in targetChatSettings) opts[key] = targetChatSettings[key]
      // const tgBotResult =
      axios
        .post(`${tgBotApiUrl}/kanban-2021/reminder/send`, opts)
        .then((res) => {
          if (!res?.data.ok) {
            for (const key in TG_CHATS.Pravosleva) opts[key] = TG_CHATS.Pravosleva[key]
            axios
              .post(`${tgBotApiUrl}/kanban-2021/reminder/send`, { ...opts, targetMD: `ERR1: ${res?.data?.message || 'No res?.data?.message'} (received from: ${clientReferer})` })
          }
        })
        .catch((err) => {
          for (const key in TG_CHATS.Pravosleva) opts[key] = TG_CHATS.Pravosleva[key]
          axios
            .post(`${tgBotApiUrl}/kanban-2021/reminder/send`, { ...opts, targetMD: `ERR2: ${err.message || 'No err.message'} (received from: ${clientReferer})` })
        })

      // const _finalMsgs = [
      //   `Отправлено из spNotifyMW без ожидания ответа: ${tgBotApiUrl}/kanban-2021/reminder/send`,
      // ]
      // if (typeof tgBotResult?.message === 'string') _finalMsgs.push(tgBotResult?.message)
      // res.status(200).send({
      //   ok: true,
      //   message: _finalMsgs.join(' // '),
      // })
    } catch (err: any) {
      console.log(err)
      // res.status(200).send({
      //   ok: false,
      //   message: `ERR in spNotifyMW: ${err.message || 'No message'}`,
      // })
    }
  }
  else next()
  
  next()
}
