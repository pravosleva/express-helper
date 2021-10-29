type TDateDiffMethod = (d1: Date, d2: Date) => number

export const DateDiff: {
    inDays: TDateDiffMethod
    inWeeks: TDateDiffMethod
    inMonths: TDateDiffMethod
    inYears: TDateDiffMethod
} = {

  inDays: function(d1, d2) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return (t2 - t1) / (24 * 3600 * 1000)
  },

  inWeeks: function(d1, d2) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return (t2 - t1) / (24 * 3600 * 1000 * 7)
  },

  inMonths: function(d1, d2) {
    const d1Y = d1.getFullYear()
    const d2Y = d2.getFullYear()
    const d1M = d1.getMonth()
    const d2M = d2.getMonth()

    return (d2M + 12 * d2Y) - (d1M + 12 * d1Y)
  },

  inYears: function(d1, d2) {
    return d2.getFullYear() - d1.getFullYear()
  }
}