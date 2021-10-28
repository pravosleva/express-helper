import { linear } from 'math-interpolate'

type TProps = {
  startDateTs: number
  targetDateTs: number
}

export const getCurrentPercentage = ({ startDateTs: t0, targetDateTs: t100 }: TProps): number => {
  const nowDate = Date.now()
  const xDate = t100 + (t100 - t0)
  const result = linear({
    x1: t0,
    y1: 0,
    x2: xDate,
    y2: 100,
    x: nowDate,
  })

  return result
}