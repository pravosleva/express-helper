import { Response as IResponse, NextFunction as INextFunction } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { EInsertDataOption, TSPRequest } from '~/routers/smartprice/mws/report/v2/types'
import axios from 'axios'

export const sendReport = async (req: TSPRequest, res: IResponse, next: INextFunction) => {
  const { rowValues } = req.body
  if (!rowValues || !Array.isArray(rowValues)) return res.status(400).send({
    ok: false,
    message: `req.rowValues is ${typeof rowValues}; Should be array`
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
  const date = new Date()
  const ts = date.getTime()
  const uiDate = date.toJSON()

  let gRes: any
  try {
    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: '/offline-tradein/main!A2',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: EInsertDataOption.INSERT_ROWS,
      requestBody: {
        values: [[uiDate, ts, ...rowValues]],
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  const result: any = {
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
    }
  }

  req.smartprice.report = {
    rowValues,
    resultId: result.id,
    ts,
  }

  res.status(200).send(result)
  next()
}

// TODO
/*
export const spNotifyMW = async (req: TSPRequest, _res: IResponse, next: INextFunction) => {
  if (!!req.smartprice.report?.rowValues) {
    const rowValues = req.smartprice.report.rowValues
    const resultId = req.smartprice.report.resultId

    try {
      axios.post('https://pravosleva.ru/tg-bot-2021/notify/sp/offline-tradein/main/send', {
        chat_id: 432590698,
        rowValues,
        resultId,
        ts: new Date().getTime(),
      })
    } catch (err) {
      console.log(err)
    }
  }
  else next()
  
  next()
}
*/

// NOTE: Send to another Google sheet
export const spRetranslateToUploadWizardMW = async (req: TSPRequest, _res: IResponse, next: INextFunction) => {
  if (!!req.smartprice.report?.rowValues) {
    const rowValues = req.smartprice.report.rowValues
    // const resultId = req.smartprice.report.resultId
    const ts = req.smartprice.report.ts
    let uiDate
    if (!!ts) {
      const date = new Date(ts)
      uiDate = date.toJSON()
    }

    // NOTE: Input sample
    // [
    //   ps.eventCode,
    //   this.uniqueSessionKey,
    //   ps.about,
    //   ps.errMessage || '',
    //   ps.whatHaveWeDone || '',
    //   ps.jsonStringified || '',
    // ]

    const allowableEventCodes = [
      'status_bad_quality',
      'status_fake',
      'status_ok',
      'status_not_checked_started',
      'status_null',

      // NOTE: Main UI debug (retranslated logs)
      'accept_err',
      'accept_ok',
      'bought_device_err',
      'bought_device_ok',
    ]

    if (!!rowValues[0] && allowableEventCodes.includes(rowValues[0])) {

      // NOTE: Output sample
      // [
      //   this.uniqueSessionKey,
      //   code,
      //   uiErrText,
      //   filesCounter,
      //   tradeinId,
      //   additionalInfo,
      //   partnerName,
      //   initPageTotalRequiredLeft,
      //   initMutatedWindowInfo,
      //   errMessage,
      //   csrfToken,
      //   originalResponseFromBackend
      // ]

      // NOTE: Try to extract additional data
      let _tradeinIdExtracted = ''
      let _partnerNameExtracted = ''
      let _resExtracted = ''
      let _serviceErrMsg = ''
      let _csrfTokenExtracted = ''
      try {
        const json = JSON.parse(rowValues[5])
        if (!!json.tradeinId) _tradeinIdExtracted = json.tradeinId
        if (!!json.partnerName) _partnerNameExtracted = json.partnerName
        if (!!json.res) _resExtracted = json.res
        if (!!json.csrfToken) _csrfTokenExtracted = json.csrfToken
      } catch (err) {
        _serviceErrMsg = err?.message || `ERR: Неизвестная ошибка при попытке распарсить: ${rowValues[5]} (${typeof rowValues[5]})`
      }

      const addInfoMsgs = []
      if (uiDate) addInfoMsgs.push(uiDate)
      if (_serviceErrMsg) addInfoMsgs.push(_serviceErrMsg)

      try {
        const modifiedRowValues = [
          rowValues[1], // uniqueSessionKey
          rowValues[0], // code
          '', // uiErrText
          '', // filesCounter
          _tradeinIdExtracted, // tradeinId,

          addInfoMsgs.length > 0 ? addInfoMsgs.join(', ') : '', // additionalInfo, (rowValues[2]?)

          _partnerNameExtracted, // partnerName,
          '', // initPageTotalRequiredLeft,
          '', // initMutatedWindowInfo,
          rowValues[3], // errMessage,
          _csrfTokenExtracted, // csrfToken,
          !!_resExtracted ? JSON.stringify(_resExtracted) : '', // originalResponseFromBackend
        ]
        axios.post('https://pravosleva.ru/express-helper/sp/report/v2/offline-tradein/upload-wizard/send', {
          rowValues: modifiedRowValues,
        })

        // NOTE: JSON for example
        // "{\"tradeinId\":115362,\"partnerName\":\"postman\",\"csrfToken\":\"9Ash2IHLTmS0TTlLrbv4RRMuoElsoIF6l8tleTl3iRq2esxwdQXapqXcXYm9iZff\",\"res\":\"test\"}"
        // "{\"tradeinId\":115362,\"partnerName\":\"postman\",\"csrfToken\":\"abc123\",\"res\":{\"ok\":true,\"message\":\"Это сообщение придет, когда фронт в основном интерфейсе узнает об изменении статуса на ok, bad_quality, fake\"}}"
      } catch (err) {
        console.log(err)
      } finally {
        next()
      }
    } else {
      console.log(`-- eventCode ${String(rowValues[0])} not allowed`)
      next()
    }
  }
  
  next()
}
