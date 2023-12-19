import v9 from '../../../server/routers/subprojects/exp.family/data/pravosleva.v9.json'

describe('family-tree-data: v9', () => {
  test('v9.length', () => {
    const tested = v9.length
    const expected = 83

    expect(tested).toEqual(expected)
  })
})
