/* eslint-disable jest/no-disabled-tests */
import { getNumsReplacedToPlainText } from '../../../server/utils/string-ops/getNumsReplacedToPlainText.ts'

describe('getNumsReplacedToPlainText', () => {
  test('case 0', () => {
    const tested = getNumsReplacedToPlainText('01')
    const expected = '0️⃣1️⃣'

    expect(tested).toEqual(expected)
  })
})
