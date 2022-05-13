export const getNormalizedWords = (words: string[]) =>
  words.join(' ').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
