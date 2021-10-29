import { getCurrentPercentage } from '~/utils/getCurrentPercentage'
import { TTask } from './types'

export class Logic {
  tasklist: TTask[];

  constructor(tasklist: TTask[]) {
    this.tasklist = tasklist;
  }

  get fullSum(): number {
    return this.tasklist.reduce((acc, task) => acc + (task.price || 0), 0)
  }
  getSumLastMonths({ months, currDate }: { months: number, currDate: Date }): number {
    const targetDate = new Date(currDate.getTime() + 1000 * 60 * 60 * 24 * 30 * months)
    const currPercentage = getCurrentPercentage({
      targetDateTs: targetDate.getTime(),
      startDateTs: currDate.getTime(),
    })

    return this.tasklist.reduce((acc, task) => {
      if (currPercentage < 100 && !task.isCompleted && task.isLooped && !!task.fixedDiff) {
        return acc + (task.price || 0)
      }
      return acc
    }, 0)
  }
}
