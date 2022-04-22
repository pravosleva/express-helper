// NOTE: v2. Совпадение по хотябы одному слову
export const testRoomNameByAnyWord = ({ room, words }: { room: string, words: string[] }): boolean => {
  const modifiedWords = words.join(' ').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const regexpGroups = modifiedWords.split(' ').map((w) => ['(?=.*' + w + ')'])
  const regexp = new RegExp('^' + regexpGroups.join('|') + '.*$', 'im')

  return regexp.test(room)
}
