import { reportMapInstance } from './state'

type TResult = {
  ok: boolean;
  message?: string
  [key: string]: any;
}

// NOTE: spuid should be taken from cookies

type TReport = string[]

// NOTE: See also https://stackoverflow.com/questions/5176384/regexp-logic-and-or/5176409
const includesWordsTest = (text: string, substr: string) => {
  const targetWords = substr?.split(',').filter((str: string) => !!str)

  // NOTE: OR operator
  // return new RegExp(targetWords.join("|")).test(text)

  // NOTE: AND operator
  // return new RegExp(`/^${targetWords.map((str) => `(?=.*\b${str}\b)`).join('')}.*$/m`).test(text)
  return new RegExp(targetWords.map((str) => `(?=.*${str})`).join('')).test(text)
}

export const reportResolveIssueAPI =async (req, res) => {
  const { substr } = req.query
  const result: TResult = {
    ok: false,
  };
  const errs: string[] = []

  try {
    if (!substr) {
      errs.push('Missed param: req.body.substr')
    } else {
      const state: { [key: string]: { report: TReport, ts: number }[] } = reportMapInstance.getState().state
  
      for (const key in state) {
        if (Array.isArray(state[key])) {
          const newStateItem = []
  
          state[key].forEach(({ report, ...rest }) => {
            const newReport: TReport = []
  
            report.forEach((item) => {
              if (!includesWordsTest(item, substr)) newReport.push(item)
            })
  
            if (newReport.length > 0) {
              newStateItem.push({ ...rest, report: newReport })
            }
          })
  
          if (newStateItem.length > 0) {
            reportMapInstance.set(key, newStateItem)
          } else {
            reportMapInstance.delete(key)
          }
        }
      }
  
      result.ok = true
    }
  } catch (err) {
    errs.push(err.message)
  }

  if (errs.length > 0) result.message = errs.join('; ')

  const { state, count } = reportMapInstance.getState()

  res.status(200).send({
    ...result,
    _originalQuery: req.query,
    state,
    count,
  })
}
