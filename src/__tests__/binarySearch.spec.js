/* eslint-disable jest/no-disabled-tests */
import { binarySearchTsIndex } from '../server/utils/binarySearch.ts'
import fakeData from './fake-data/binarySearch.set-01.json'

describe('Search index', () => {
  test.skip('it should be correct', () => {
    const roomData = fakeData.data['ux-test']
    const targetTs = 1645164716822
    const i1 = binarySearchTsIndex({ messages: roomData, targetTs })
    const i2 = roomData.findIndex(({ ts }) => ts === targetTs)

    expect(i1).toEqual(i2)
  })
})
