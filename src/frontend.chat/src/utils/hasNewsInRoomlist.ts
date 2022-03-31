export const hasNewsInRoomlist = (
  roomList: { name: string, ts: number }[],
  tsMap: {[key: string]: number},
  currentRoom: string
): boolean => {
  let result = false

  for (let i = 0, max = roomList.length; i < max; i++) {
    const { name, ts } = roomList[i]
    const tsFromNewMap = !!tsMap[name] ? tsMap[name] : null

    if (!!tsFromNewMap) {
      const hasNews = tsFromNewMap > ts && currentRoom !== name

      if (hasNews) {
        result = true
        break
      }
    }
  }

  return result
}