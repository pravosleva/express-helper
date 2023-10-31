const numsToPlainTextMap = {
  '0': '0️⃣',
  '1': '1️⃣',
  '2': '2️⃣',
  '3': '3️⃣',
  '4': '4️⃣',
  '5': '5️⃣',
  '6': '6️⃣',
  '7': '7️⃣',
  '8': '8️⃣',
  '9': '9️⃣',
}
export const getNumsReplacedToPlainText = (s: string): string => {
  // NOTE: See also https://stackoverflow.com/questions/10726638/how-do-you-map-replace-characters-in-javascript-similar-to-the-tr-function-in
  return s.replace(/[0-9]/g, function (m) {
    return numsToPlainTextMap[m]
  })
}
