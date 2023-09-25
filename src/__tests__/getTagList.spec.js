/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable jest/no-disabled-tests */
import { getTagList } from '../server/utils/string-ops/getTagList'
import { getRandomString } from '../server/utils/getRandomString'

// const { performance } = require('perf_hooks')

const hugeArray = [] // ['tst msg #one', 'tst msg #two', '#one #two tst msg #three, exp #1']
const limit = 10 ** 3
for (let i = 0; i < limit; i++) {
  hugeArray.push(
    `#${getRandomString(8)} #${getRandomString(7)} #${getRandomString(6)} #${getRandomString(5)} #${getRandomString(
      4
    )} #${getRandomString(3)} tst msg`
  )
}
const expectedHugeArrResult = getTagList({
  originalMsgList: hugeArray,
}) // ['#one', '#two', '#three', '#1']

describe(`getTagList: ${limit} items`, () => {
  test('case 1', () => {
    const originalMsgList = hugeArray
    const expectedList = expectedHugeArrResult

    // const t0 = performance.now() // new Date().getTime()

    const tagList = getTagList({
      originalMsgList,
    })
    // const t1 = performance.now()
    // console.log(`case 1 perf: ${t1 - t0}`)

    expect(tagList).toEqual(expectedList)
  })

  test('case 2', () => {
    const originalMsgList = hugeArray
    const expectedList = expectedHugeArrResult

    // const t0 = performance.now()

    const result = originalMsgList
      .join(' ')
      .split(/[^#\w]+/)
      .filter(([a]) => a === '#')

    const tagList = [...new Set(result)]

    // const t1 = performance.now()
    // console.log(`case 2 perf: ${t1 - t0}`)

    expect(tagList).toEqual(expectedList)
  })

  test('case 3', () => {
    const originalMsgList = hugeArray
    const expectedList = expectedHugeArrResult

    // const t0 = performance.now()

    const result = []
    let i = 0
    while (i < originalMsgList.length) {
      result.push(...originalMsgList[i].match(/#\w+/g))
      i += 1
    }

    const tagList = [...new Set(result)]

    // const t1 = performance.now()
    // console.log(`case 3 perf: ${t1 - t0}`)

    expect(tagList).toEqual(expectedList)
  })

  test('case 4', () => {
    const originalMsgList = hugeArray
    const expectedList = expectedHugeArrResult

    // const t0 = performance.now()

    const result = new Set()
    let i = 0
    while (i < originalMsgList.length) {
      let j = 0
      const innerArr = originalMsgList[i].match(/#\w+/g) || []
      while (j < innerArr.length) {
        result.add(innerArr[j])
        j += 1
      }
      i += 1
    }

    const tagList = [...new Set(result)]

    // const t1 = performance.now()
    // console.log(`case 4 perf: ${t1 - t0}`)

    expect(tagList).toEqual(expectedList)
  })

  test('case 5', () => {
    const originalMsgList = hugeArray
    const expectedList = expectedHugeArrResult

    // const t0 = performance.now()

    const result = originalMsgList
      .join(' ')
      .split(/[^#\w]+/)
      .filter(([a]) => a === '#')

    const tagList = [...new Set(result)]

    // const t1 = performance.now()
    // console.log(`case 5 perf: ${t1 - t0}`)

    expect(tagList).toEqual(expectedList)
  })

  test('case 6', () => {
    const originalMsgList = hugeArray
    const expectedList = expectedHugeArrResult

    // const t0 = performance.now()

    const result = originalMsgList.join(' ').split(/(?:^| )(?!#)[^#]*|(?<=#\S+)[^#\w]+(?:[^#]+)?/)

    const s = new Set()
    for (let i = 0; i < result.length; i += 1) {
      const w = result[i]
      if (w) s.add(w)
    }
    const tagList = [...s]

    // const t1 = performance.now()
    // console.log(`case 6 perf: ${t1 - t0}`)

    expect(tagList).toEqual(expectedList)
  })

  test('case 7: empty taglist', () => {
    const originalMsgList = ['test message without tags']
    const expectedList = []

    // const t0 = performance.now()

    const result = originalMsgList.join(' ').split(/(?:^| )(?!#)[^#]*|(?<=#\S+)[^#\w]+(?:[^#]+)?/)

    const s = new Set()
    for (let i = 0; i < result.length; i += 1) {
      const w = result[i]
      if (w) s.add(w)
    }
    const tagList = [...s]

    // const t1 = performance.now()
    // console.log(`case 6 perf: ${t1 - t0}`)

    expect(tagList).toEqual(expectedList)
  })
})
