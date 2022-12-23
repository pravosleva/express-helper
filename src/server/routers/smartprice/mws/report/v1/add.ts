import { reportMapInstance } from './state'

type TResult = {
  ok: boolean;
  message?: string
  [key: string]: any;
}

// NOTE: spuid should be taken from cookies

export const reportAddAPI =async (req, res) => {
  const { spuid, json , metrics } = req.body
  const result: TResult = {
    ok: false
  };
  const startupDate = new Date(reportMapInstance.startTs).toISOString()
  const errs: string[] = []

  if (!spuid) {
    errs.push('Missed param: req.body.spuid')
  } else if (!json) {
    errs.push('Missed param: req.body.json')
  } else {
    const ts = Date.now()
    const newData: any = { report: json, ts }

    if (!!metrics) newData.metrics = metrics

    reportMapInstance.add(spuid, newData)
    result.ok = true
  }

  if (errs.length > 0) result.message = errs.join('; ')

  res.status(200).send({
    ...result,
    _originalBody: req.body,
    startupDate,
  })
}
