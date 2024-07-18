import { testTextByAnyWord } from '../../../../server/utils/string-ops/testTextByAnyWord'
import { getNormalizedWordsArr } from '../../../../server/utils/string-ops/getNormalizedWords'

describe('testTextByAnyWord', () => {
  test('empty text (string)', () => {
    const text = ''
    const wordsAsString = 'one two'

    const tested = testTextByAnyWord({
      text,
      words: getNormalizedWordsArr(wordsAsString.split(' ').filter((str) => !!str)),
    })
    const expected = false

    expect(tested).toEqual(expected)
  })

  test('empty text (undefined)', () => {
    const text = undefined
    const wordsAsString = 'one two'

    const tested = testTextByAnyWord({
      text,
      words: getNormalizedWordsArr(wordsAsString.split(' ').filter((str) => !!str)),
    })
    const expected = false

    expect(tested).toEqual(expected)
  })

  test('not empty text (true)', () => {
    const text = 'one'
    const wordsAsString = 'one two'

    const tested = testTextByAnyWord({
      text,
      words: getNormalizedWordsArr(wordsAsString.split(' ').filter((str) => !!str)),
    })
    const expected = true

    expect(tested).toEqual(expected)
  })

  test('not empty text (false)', () => {
    const text = 'ons'
    const wordsAsString = 'one two'

    const tested = testTextByAnyWord({
      text,
      words: getNormalizedWordsArr(wordsAsString.split(' ').filter((str) => !!str)),
    })
    const expected = false

    expect(tested).toEqual(expected)
  })
})
