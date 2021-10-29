// Input:
// { months: number, currDate: Date, tasklist: TTask[] }

var getSumLastMonths = ({ months, currDate, tasklist }) => {
  const targetDate = new Date(currDate.getTime() + 1000 * 60 * 60 * 24 * 30 * months)
  const currPercentage = getCurrentPercentage({
    targetDateTs: targetDate.getTime(),
    startDateTs: currDate.getTime(),
  })

  return tasklist.reduce((acc, task) => {
    if (currPercentage < 100 && !task.isCompleted && task.isLooped && !!task.fixedDiff) {
      return acc + (task.price || 0)
    }
    return acc
  }, 0)
}