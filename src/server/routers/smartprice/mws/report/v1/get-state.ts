import { reportMapInstance } from './state'

type TResult = {
  ok: boolean;
  message?: string;
  total?: number;
  [key: string]: any;
}

export const reportGetStateAPI = async (req, res) => {
  const { spuid, from, to } = req.query
  const result: TResult = {
    ok: false,
    state: null
  };
  let errs: string[] = []
  const startupDate = new Date(reportMapInstance.startTs).toISOString()

  try {
    if (!!spuid) {
      const theState = reportMapInstance.get(spuid)

      if (!!theState) {
        result.state = theState
      } else {
        errs.push(`State not found for spuid ${spuid}`)
      }
    } else {
      try {
        if (!!from || !!to) {
          const { state, count } = reportMapInstance.getStateTSRange({ from: Number(from), to: Number(to) })
          result.state = state
          result.count = count
        } else {
          const { state, count } = reportMapInstance.getState()
          result.state = state
          result.count = count
        }
      } catch (err) {
        throw err
      }
    }
    
    result.ok = true
  } catch (err) {
    errs.push(err.message)
  }

  if (errs.length > 0) result.message = errs.join('; ')

  res.status(200).send({
    ...result,
    _originalQuery: req.query,
    startupDate,
  })
}
