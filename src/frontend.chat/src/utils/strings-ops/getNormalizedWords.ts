export const getNormalizedWords = (words: string[]): string =>
  words.join(' ').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

export const getNormalizedWordsArr = (words: string[]): string[] =>
  getNormalizedWords(words).replace(/:/g, '').split(' ')
