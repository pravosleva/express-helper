export const getTagList = ({
  originalMsgList,
}: {
  originalMsgList: string[];
}): {
  list: string[];
  sortedList: string[];
  extended: {
    [key: string]: {
      name: string;
      counter: number;
    };
  };
} => {
  const abSort = (a: string, b: string) => a.localeCompare(b)
  const extended: any = {}
  const uniqueTagsMap = originalMsgList.reduce((obj, msg) => {
    try {
      for (const tag of msg.match(/#[a-zA-Zа-яА-Я0-9]+/g) || []) {
        // @ts-ignore
        if (!!tag && !obj[tag]) obj[tag] = true

        if (!extended[tag])
          extended[tag] = {
            name: tag,
            counter: 1
          }
        else extended[tag].counter += 1
      }
    } catch (err) {
      console.groupCollapsed(`- getTagList err levl 1 (msg: ${msg})`)
      console.warn(err)
      console.log(msg)
      console.log(typeof msg)
      console.groupEnd()
    }

    return obj
  }, {});

  return {
    list: Object.keys(uniqueTagsMap),
    sortedList: Object.keys(uniqueTagsMap).sort(abSort),
    extended,
  }
}
