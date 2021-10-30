// Input:
// { months: number, currDate: Date, tasklist: TTask[] }

var getSumLastMonths = ({ months, currDate, tasklist }) => {
  const nowDateTs = currDate.getTime()
  const mTsDelta = 1000 * 60 * 60 * 24 * 30 * months
  const targetDate = new Date(nowDateTs + mTsDelta)
  const currPercentage = getCurrentPercentage({
    targetDateTs: targetDate.getTime(),
    startDateTs: currDate.getTime(),
  })

  return tasklist.reduce((acc, task) => {
    if (currPercentage < 100 && !task.isCompleted && task.isLooped && !!task.fixedDiff && task.checkTsList[0] <= targetDate) {
      return acc + (task.price || 0)
    }
    return acc
  }, 0)
}