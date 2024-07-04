/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/no-disabled-tests */
// import { capitalCase } from '../../../../server/utils/string-ops/change-case@5.4.4.ts'
// import * as changeCase from '../../../../server-dist/utils/string-ops/change-case@5.4.4.js'

describe('change-case', () => {
  test('empty', () => {
    const tested = 'Enter Imei'
    const expected = 'Enter Imei'
    expect(tested).toEqual(expected)
  })

  // test.skip('capitalCase', () => {
  //   const tested = changeCase.capitalCase('enter-imei')
  //   const expected = 'Enter Imei'
  //   expect(tested).toEqual(expected)
  // })
})
