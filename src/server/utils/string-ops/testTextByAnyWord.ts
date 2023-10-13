// NOTE: v2. Совпадение по хотябы одному слову
export const testTextByAnyWord = ({ text, words }: { text: string, words: string[] }): boolean => {
  const modifiedWords = words.join(' ').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const regexpGroups = modifiedWords.split(' ').map((w) => ['(?=.*' + w + ')'])
  const regexp = new RegExp('^' + regexpGroups.join('|') + '.*$', 'im')

  return regexp.test(text)
}
