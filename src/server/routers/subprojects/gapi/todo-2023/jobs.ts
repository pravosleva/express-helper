import { Request as IRequest, Response as IResponse } from 'express'
// @ts-ignore
import { google } from 'googleapis'
import { IJob } from '~/utils/todo-2023/types'

const _getJobs = ({
  sheetData: rows,
}): IJob[] => {
  const jobs = []

  for (const row of rows) {
    switch (true) {
      case !!row[0]:
        // NOTE: New job
        const newJob = {
          name: row[0],
          subjobs: []
        }

        if (!!row[1]) {
          // NOTE: New subjob
          newJob.subjobs.push({
            name: row[1],
          })
        }
        jobs.push(newJob)
        break
      case !!row[1]:
        if (jobs.length === 0) continue
        // NOTE: New subjob
        jobs[jobs.length - 1].subjobs.push({
          name: row[1],
        })
        break
      default:
        // NOTE: Skip
        break
    }
  }

  return jobs
}

export const getJobs = async (req: IRequest, res: IResponse) => {
  const { limit = 1000 } = req.body
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
      range: `/todo-2023/jobs!A3:E${2 + modifiedLimit}`,
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
    result.jobs = _getJobs({
      sheetData: gRes.data.values,
    })
  } else {
    result.ok = false
    result.gRes = gRes
    result.message = 'In progress'
    result.jobs = []
  }

  res.status(200).send(result)
}
