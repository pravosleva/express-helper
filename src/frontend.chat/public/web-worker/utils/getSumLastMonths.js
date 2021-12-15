// Input:
// { months: number, currDate: Date, tasklist: TTask[] }

var getSumLastMonths = ({ months, currDate, tasklist }) => {
  const nowDateTs = currDate.getTime()
  const mTsDelta = months * 1000 * 60 * 60 * 24 * 30
  const _targetDeadline = new Date(nowDateTs + mTsDelta)
  const isTaskCounterDone = (task) => {
    let result = false

    if (!!task.fixedDiff && !!task.uncheckTsList) {
      // const targetDate = new Date(task.uncheckTsList[0] + task.fixedDiff) // (task.checkTsList[0] - task.uncheckTsList[0]))
      const title = `-${task.price}`

      // console.group(title)
      const targetDate = new Date(task.uncheckTsList[0] + task.fixedDiff)
      const targetDateTs = targetDate.getTime()
      const currStage = getCurrentPercentage({
        targetDateTs,
        startDateTs: task.uncheckTsList[0]
      })

      // console.log(currStage)

      if (currStage >= 100) { // Counter in progress
        // console.log(currStage)
        if (task.isCompleted) {
          // console.log(currStage, task.isCompleted)
          result = true

          // -- TODO: isReady AND not more than <MONTHS>
          // const hasDeadlineAchieved  = (task.uncheckTsList[0] - task.fixedDiff) - (targetDeadline - mTsDelta) < 0

          // console.log(hasDeadlineAchieved)
          // if (hasDeadlineAchieved) {
          //   console.log('CASE 4')
          //   result = true
          // }
          // --
        } else {
          
          result = false
        }
      } else {
        result = false
      }
      
      // console.groupEnd(title)
    }

    return result
  }

  return tasklist.reduce((acc, task) => {
    if (
      !!task.uncheckTsList && Array.isArray(task.uncheckTsList) && task.uncheckTsList.length > 0
      && !!task.checkTsList && Array.isArray(task.checkTsList) && task.checkTsList.length > 0

      // 1. Base requirements:
      // && task.isLooped
      && !!task.fixedDiff

      // 2. NOTE: Waiting time (not asap)
      // Counter is done OR incompleted:
      && ((isTaskCounterDone(task) && task.isCompleted) || (!task.isCompleted))
      // INCORRECT CONDITION: && !task.isCompleted // Task in progress
      
      // 3. Valid range:
      // && task.checkTsList[0] <= targetDate // Global (montn 1, 2, 3, 6)
    ) {
      return acc + (task.price || 0)
    }
    return acc
  }, 0)
}