/* eslint-disable jest/no-disabled-tests */
import { binarySearchTsIndex } from '../server/utils/binarySearch.ts'
import fakeData from './fake-data/binarySearch.set-01.json'
import fakeDataSorted from './fake-data/binarySearch.set-02-sorted.json'
// import { sortByTs } from '../server/utils/sortByTs'

describe('Search index', () => {
  test.skip('it should be correct', () => {
    const roomData = fakeData.data['ux-test'] // .sort(sortByTs)
    const targetTs = 1645164716822
    const i1 = binarySearchTsIndex({ messages: roomData, targetTs })
    const i2 = roomData.findIndex(({ ts }) => ts === targetTs)

    expect(i2).toEqual(i1)
  })

  test('binarySearchTsIndex', () => {
    const roomData = fakeDataSorted.data['ux-test']
    const targetTs = 1645164716822
    const i1 = binarySearchTsIndex({ messages: roomData, targetTs })
    const i2 = roomData.findIndex(({ ts }) => ts === targetTs)

    expect(i2).toEqual(i1)
  })
})
