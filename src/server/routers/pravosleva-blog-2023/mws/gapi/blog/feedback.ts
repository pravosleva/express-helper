import { EInsertDataOption, TWithBlogRequest } from '~/routers/pravosleva-blog-2023/types'
import { THelp } from '~/utils/express-validation'
import { google } from 'googleapis'

// NOTE: page 1mMA2t1i5IcOyyfMQlk2nV4GL0hYJ8Kje7Ot59qHBvsY

export const rules: THelp = {
  params: {
    body: {
      companyName: {
        type: 'string',
        descr: 'Company Name',
        required: true,
        validate: (val: any) => ({
          ok: !!val && typeof val === 'string',
          reason: 'Should be a string which not empty',
        }),
      },
      contactName: {
        type: 'string',
        descr: 'Contact Name',
        required: true,
        validate: (val: any) => ({
          ok: !!val && typeof val === 'string',
          reason: 'Should be a string which not empty',
        }),
      },
      comment: {
        type: 'string',
        descr: 'Comment',
        required: true,
        validate: (val: any) => ({
          ok: !!val && typeof val === 'string',
          reason: 'Should be a string which not empty',
        }),
      },
    },
  },
}

export const feedback = async (req: TWithBlogRequest, res, _next) => {
  const { companyName, contactName, comment } = req.body
  let auth: any
  try {
    auth = req.pravoslevaBlog2023.googleSheetsAuth
  } catch (err) {
    console.log(err)
    return res.status(200).send({
      ok: false,
      message: err.message || 'No err.message'
    })
  }

  // Create client instance for auth
  const client = await auth.getClient()
  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: 'v4', auth: client })
  const spreadsheetId = '1mMA2t1i5IcOyyfMQlk2nV4GL0hYJ8Kje7Ot59qHBvsY'

  // Write row(s) to spreadsheet
  let gRes: any
  const nowDate = new Date()
  const nowDteaJson = nowDate.toJSON()
  try {
    gRes = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: '/blog/feedback!A3',
      valueInputOption: 'USER_ENTERED',

      // NOTE: Legacy param?
      // resource: { values: [[insertDataOption, 'h']], },

      // -- NOTE: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append#InsertDataOption
      insertDataOption: EInsertDataOption.INSERT_ROWS,
      // --

      requestBody: {
        values: [[nowDteaJson, companyName, contactName, comment]],
      },
    })
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: `By Google: ${err.message || 'No err.message'}`
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
      result.message = `Ваше обращение #${lastRow}`
    } catch (err) {
      result.message = err.message || 'Не удалось распарсить до id'
    }
  }

  return res.status(200).send(result)
}
