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
    // TODO: set to state
    reportMapInstance.set(spuid, json)
    result.ok = true
  }

  if (errs.length > 0) result.message = errs.join('; ')

  res.status(200).send({
    ...result,
    _originalBody: req.body,
  })
}
