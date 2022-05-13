import { getNormalizedWords } from './getNormalizedWords'

// NOTE: v1. Совпадение по всем словам
export const testRoomNameByAllWords = ({ room, words }: { room: string, words: string[] }): boolean => {
  const modifiedWords = getNormalizedWords(words)
  // Split your string at spaces & Encapsulate your words inside regex groups:
  const regexpGroups = modifiedWords.split(' ').map((w) => ['(?=.*' + w + ')'])
  // Create a regex pattern:
  const regexp = new RegExp('^' + regexpGroups.join('') + '.*$', 'im')

  return regexp.test(room)
}
