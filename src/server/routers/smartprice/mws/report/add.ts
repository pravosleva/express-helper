import { reportMapInstance } from './state'

type TResult = {
  ok: boolean;
  message?: string
  [key: string]: any;
}

// NOTE: spuid should be taken from cookies

export const reportAddAPI =async (req, res) => {
  const { spuid, json } = req.body
  const result: TResult = {
    ok: false
  };

  let errs: string[] = []

  if (!spuid) {
    errs.push('Missed param: req.body.spuid')
  } else if (!json) {
    errs.push('Missed param: req.body.json')
  } else {
    const ts = Date.now()

    reportMapInstance.add(spuid, { ...json, ts })
    result.ok = true
  }

  if (errs.length > 0) result.message = errs.join('; ')

  res.status(200).send({
    ...result,
    _originalBody: req.body,
  })
}
