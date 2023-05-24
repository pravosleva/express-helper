/* eslint-disable jest/no-disabled-tests */
import { getTimeDiff } from '../server/utils/getTimeDiff'

describe('getTimeDiff', () => {
  test('timeDiff.message: 1 year', () => {
    const date1 = new Date(2022, 1, 1)
    const date2 = new Date(2023, 1, 1)
    const timeDiff = getTimeDiff({
      startDate: date1,
      finishDate: date2,
    })

    // eslint-disable-next-line no-console
    // console.log(timeDiff)
    // NOTE: { d: 365, h: 0, min: 0, sec: 0, ms: 0, message: '365d 00:00' }

    expect(timeDiff.message).toEqual('365d 00:00')
  })

  test('timeDiff.isNegative: 0 (no)', () => {
    const date1 = new Date(2022, 1, 1)
    const date2 = new Date(2022, 1, 1)
    const timeDiff = getTimeDiff({
      startDate: date1,
      finishDate: date2,
    })

    expect(timeDiff.isNegative).toEqual(false)
  })

  test('timeDiff.isNegative: < 0 (yes)', () => {
    const date1 = new Date(2023, 1, 1)
    const date2 = new Date(2022, 1, 1)
    const timeDiff = getTimeDiff({
      startDate: date1,
      finishDate: date2,
    })

    expect(timeDiff.isNegative).toEqual(true)
  })

  test('timeDiff.isNegative: > 0 (no)', () => {
    const date1 = new Date(2022, 1, 1)
    const date2 = new Date(2023, 1, 1)
    const timeDiff = getTimeDiff({
      startDate: date1,
      finishDate: date2,
    })

    expect(timeDiff.isNegative).toEqual(false)
  })
})
